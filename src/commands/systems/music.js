import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import music from "../../systems/music/index.js";
import { createSystemPanel, replyEphemeral } from "../../core/systemPanel.js";

export default {
    category: "music",
    permission: PermissionFlagsBits.Connect,
    data: new SlashCommandBuilder().setName("music").setDescription("Open the music management panel."),
    async execute(client, interaction) {
        const voiceChannel = interaction.member?.voice?.channel;
        let joinNotice = "Not connected to voice";

        if (voiceChannel) {
            try {
                await music.manager.join(interaction.guildId, voiceChannel);
                joinNotice = `🔊 Connected to **${voiceChannel.name}**`;
            } catch (error) {
                joinNotice = `⚠️ ${error.message}`;
            }
        }

        const state = music.manager.getState?.(interaction.guildId) ?? {};
        return replyEphemeral(interaction, createSystemPanel({
            name: "Music",
            emoji: "🎵",
            description: "Control playback, queue management, volume, loop mode and music configuration.",
            status: `${joinNotice} • ${state?.playing ? `▶️ ${state.current?.title ?? "Playing"}` : "⏹️ Idle"} • 🔊 ${music.manager.getVolume?.(interaction.guildId) ?? 80}% • 🔁 ${music.manager.getLoop?.(interaction.guildId) ?? "off"}`,
            buttons: [
                { id: "music:join", label: "Join", emoji: "🔊", style: 1 },
                { id: "music:play", label: "Play", emoji: "▶️", style: 3 },
                { id: "music:queue", label: "Queue", emoji: "📜" },
                { id: "music:pause", label: "Pause", emoji: "⏸️" },
                { id: "music:resume", label: "Resume", emoji: "▶️" },
                { id: "music:skip", label: "Skip", emoji: "⏭️" },
                { id: "music:stop", label: "Stop", emoji: "⏹️", style: 4 },
                { id: "music:shuffle", label: "Shuffle", emoji: "🔀" },
                { id: "music:clear", label: "Clear", emoji: "🗑️", style: 4 },
                { id: "music:volume-down", label: "Vol -10", emoji: "🔉" },
                { id: "music:volume-up", label: "Vol +10", emoji: "🔊", style: 3 },
                { id: "music:volume-mute", label: "Mute", emoji: "🔇" },
                { id: "music:loop", label: "Loop", emoji: "🔁" }
            ]
        }));
    }
};
