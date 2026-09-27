import {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags
} from "discord.js";
import play from "@iamtraction/play-dl";
import musicManager from "./musicManager.js";

class MusicHandler {
    async handleInteraction(i) {
        if (!i?.customId?.startsWith("music:")) return false;

        const [, action] = i.customId.split(":");
        const guildId = i.guildId;
        if (!guildId) return false;

        if (i.isButton()) {
            if (action === "join") return this.join(i);
            if (action === "play") return this.playModal(i);
            if (action === "queue") {
                const queue = musicManager.getQueue(guildId);
                const current = musicManager.getCurrent(guildId);
                const lines = [current ? `▶️ Now: **${current.title}**` : "⏹️ Nothing playing"];
                if (queue.length) {
                    lines.push(...queue.slice(0, 15).map((track, index) => `${index + 1}. ${track.title}`));
                } else {
                    lines.push("Queue is empty.");
                }
                return i.reply({ content: lines.join("\n").slice(0, 1900), flags: MessageFlags.Ephemeral });
            }
            if (action === "pause") return i.reply({ content: musicManager.pause(guildId) ? "⏸️ Paused." : "❌ Nothing is playing.", flags: MessageFlags.Ephemeral });
            if (action === "resume") return i.reply({ content: musicManager.resume(guildId) ? "▶️ Resumed." : "❌ Nothing is paused.", flags: MessageFlags.Ephemeral });
            if (action === "skip") return i.reply({ content: (await musicManager.skip(guildId)) ? "⏭️ Skipped." : "❌ Nothing is playing.", flags: MessageFlags.Ephemeral });
            if (action === "stop") { musicManager.stop(guildId); return i.reply({ content: "⏹️ Stopped and cleared the queue.", flags: MessageFlags.Ephemeral }); }
            if (action === "shuffle") { musicManager.shuffle(guildId); return i.reply({ content: "🔀 Queue shuffled.", flags: MessageFlags.Ephemeral }); }
            if (action === "clear") { musicManager.clear(guildId); return i.reply({ content: "🗑️ Queue cleared.", flags: MessageFlags.Ephemeral }); }
            if (action === "volume-down") return this.changeVolume(i, -10);
            if (action === "volume-up") return this.changeVolume(i, 10);
            if (action === "volume-mute") return this.changeVolume(i, 0, true);
            if (action === "loop") return this.cycleLoop(i);
        }

        if (i.isModalSubmit() && action === "play-modal") return this.searchAndPlay(i);
        return false;
    }

    async join(i) {
        const channel = i.member?.voice?.channel;
        if (!channel) return i.reply({ content: "🔊 Join a voice channel first, then press **Join**.", flags: MessageFlags.Ephemeral });

        try {
            await musicManager.join(i.guildId, channel);
            return i.reply({ content: `🔊 Joined **${channel.name}**.`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            return i.reply({ content: `❌ ${error.message}`, flags: MessageFlags.Ephemeral });
        }
    }

    async playModal(i) {
        const channel = i.member?.voice?.channel;
        if (!channel) return i.reply({ content: "🔊 Join a voice channel first, then press **Play**.", flags: MessageFlags.Ephemeral });

        try {
            await musicManager.join(i.guildId, channel);
        } catch (error) {
            return i.reply({ content: `❌ ${error.message}`, flags: MessageFlags.Ephemeral });
        }

        const modal = new ModalBuilder()
            .setCustomId("music:play-modal")
            .setTitle("Play Music");

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("query")
                    .setLabel("Song name or YouTube URL")
                    .setPlaceholder("e.g. Never Gonna Give You Up")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(200)
            )
        );

        await i.showModal(modal);
        return true;
    }

    async searchAndPlay(i) {
        const query = i.fields.getTextInputValue("query").trim();
        if (!query) return i.reply({ content: "❌ Enter a song name or URL.", flags: MessageFlags.Ephemeral });

        await i.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const voiceChannel = i.member?.voice?.channel;
            if (!voiceChannel) return i.editReply("🔊 Join a voice channel first.");
            await musicManager.join(i.guildId, voiceChannel);

            let result;
            if (/^https?:\/\//i.test(query)) {
                const info = await play.video_basic_info(query);
                result = {
                    title: info.video_details.title,
                    url: info.video_details.url,
                    duration: info.video_details.durationRaw,
                    thumbnail: info.video_details.thumbnails?.[0]?.url ?? null
                };
            } else {
                const results = await play.search(query, { limit: 1, source: { youtube: "video" } });
                if (!results.length) return i.editReply("❌ I couldn't find that song.");
                const video = results[0];
                result = {
                    title: video.title,
                    url: video.url,
                    duration: video.durationRaw,
                    thumbnail: video.thumbnails?.[0]?.url ?? null
                };
            }

            const state = musicManager.getState(i.guildId);
            const currentlyPlaying = Boolean(state?.playing || state?.current);
            if (currentlyPlaying) {
                const queued = musicManager.add(i.guildId, result);
                if (!queued) return i.editReply("❌ The music queue is full.");
                return i.editReply(`🎵 Added **${result.title}** to the queue.`);
            }

            await musicManager.play(i.guildId, result);
            return i.editReply(`▶️ Now playing **${result.title}** in **${voiceChannel.name}**.`);
        } catch (error) {
            console.error("[Music] Search/play error:", error);
            return i.editReply(`❌ Music error: ${error.message}`);
        }
    }

    async changeVolume(i, delta, mute = false) {
        const current = musicManager.getVolume(i.guildId) ?? 80;
        const next = mute ? 0 : Math.max(0, Math.min(100, current + delta));
        const value = musicManager.setVolume(i.guildId, next);
        if (value === false) {
            return i.reply({ content: "❌ Volume could not be changed.", flags: MessageFlags.Ephemeral });
        }
        return i.reply({ content: `🔊 Volume: **${value}%** — applied immediately to the current track.`, flags: MessageFlags.Ephemeral });
    }

    async cycleLoop(i) {
        const modes = ["off", "track", "queue"];
        const current = musicManager.getLoop(i.guildId) ?? "off";
        const next = modes[(modes.indexOf(current) + 1) % modes.length];
        musicManager.setLoop(i.guildId, next);
        const labels = { off: "off", track: "current track", queue: "queue" };
        return i.reply({ content: `🔁 Loop: **${labels[next]}**. Applied immediately.`, flags: MessageFlags.Ephemeral });
    }
}

export default new MusicHandler();
