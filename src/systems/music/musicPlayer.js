/**
 * ============================================================
 * Nocthera v1.1.0
 * Music Player
 * ============================================================
 */

import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    entersState,
    joinVoiceChannel,
    VoiceConnectionStatus
} from "@discordjs/voice";
import play from "@iamtraction/play-dl";
import ffmpegPath from "ffmpeg-static";
import path from "node:path";
import { delimiter } from "node:path";

// Make the bundled FFmpeg executable discoverable to play-audio/prism-media.
// This avoids requiring a separate system-wide FFmpeg installation.
if (ffmpegPath) {
    process.env.FFMPEG_PATH = ffmpegPath;
    const ffmpegDir = path.dirname(ffmpegPath);
    const currentPath = process.env.PATH ?? "";
    if (!currentPath.split(delimiter).includes(ffmpegDir)) {
        process.env.PATH = `${ffmpegDir}${delimiter}${currentPath}`;
    }
}
import musicService from "./musicService.js";
import musicQueue from "./musicQueue.js";

class MusicPlayer {
    constructor() {
        this.players = new Map();
        this.connections = new Map();
    }

    get(guildId) {
        if (!this.players.has(guildId)) {
            const audioPlayer = createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Stop }
            });

            const state = {
                audioPlayer,
                playing: false,
                paused: false,
                current: null,
                startedAt: null,
                position: 0,
                loading: false,
                resource: null
            };

            audioPlayer.on(AudioPlayerStatus.Idle, () => {
                void this.playNext(guildId);
            });

            audioPlayer.on("error", (error) => {
                console.error(`[Music] Audio error in ${guildId}:`, error);
                state.playing = false;
                state.paused = false;
                state.loading = false;
                musicService.setPlaying(guildId, false);
                musicService.setPaused(guildId, false);
                void this.playNext(guildId);
            });

            this.players.set(guildId, state);
        }

        return this.players.get(guildId);
    }

    async join(guildId, voiceChannel) {
        if (!voiceChannel?.guild) {
            throw new Error("You must be in a voice channel first.");
        }

        const permissions = voiceChannel.permissionsFor(voiceChannel.guild.members.me);
        if (!permissions?.has("Connect") || !permissions?.has("Speak")) {
            throw new Error("I need Connect and Speak permissions in that voice channel.");
        }

        const existing = this.connections.get(guildId);
        if (existing && existing.joinConfig.channelId === voiceChannel.id) {
            return existing;
        }

        if (existing) {
            existing.destroy();
            this.connections.delete(guildId);
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: true
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
        } catch (error) {
            connection.destroy();
            throw new Error(`I couldn't join the voice channel: ${error.message}`);
        }

        connection.subscribe(this.get(guildId).audioPlayer);
        this.connections.set(guildId, connection);
        musicService.setVoiceChannel(guildId, voiceChannel.id);
        return connection;
    }

    async play(guildId, track = null) {
        const player = this.get(guildId);
        const nextTrack = track ?? musicQueue.next(guildId);

        if (!nextTrack) {
            player.playing = false;
            player.paused = false;
            player.current = null;
            player.startedAt = null;
            musicService.setPlaying(guildId, false);
            musicService.setCurrentTrack(guildId, null);
            return null;
        }

        const connection = this.connections.get(guildId);
        if (!connection) {
            musicQueue.add(guildId, nextTrack);
            throw new Error("No voice connection. Use Join first.");
        }

        player.loading = true;
        try {
            const source = nextTrack.url;
            const stream = await play.stream(source, {
                quality: 2,
                discordPlayerCompatibility: false
            });

            const resource = createAudioResource(stream.stream, {
                inputType: stream.type ?? StreamType.WebmOpus,
                inlineVolume: true,
                metadata: { guildId, track: nextTrack }
            });

            const volume = musicService.getVolume(guildId) ?? 80;
            resource.volume?.setVolume(volume / 100);
            player.resource = resource;
            player.audioPlayer.play(resource);

            player.playing = true;
            player.paused = false;
            player.current = nextTrack;
            player.startedAt = Date.now();
            player.position = 0;
            player.loading = false;

            musicService.setCurrentTrack(guildId, nextTrack);
            musicService.setPlaying(guildId, true);
            musicService.setPaused(guildId, false);
            return nextTrack;
        } catch (error) {
            player.loading = false;
            player.resource = null;
            console.error(`[Music] Failed to play ${nextTrack.url}:`, error);
            musicService.setPlaying(guildId, false);
            musicService.setCurrentTrack(guildId, null);
            throw new Error(`I couldn't play **${nextTrack.title}**. ${error.message}`);
        }
    }

    async playNext(guildId) {
        const player = this.get(guildId);
        if (player.loading) return null;

        const loop = musicService.getLoop(guildId);
        if (loop === "track" && player.current) {
            return this.play(guildId, player.current);
        }

        if (loop === "queue" && player.current) {
            musicQueue.add(guildId, player.current);
        }

        player.playing = false;
        player.paused = false;
        musicService.setPlaying(guildId, false);
        musicService.setPaused(guildId, false);
        return this.play(guildId);
    }

    pause(guildId) {
        const player = this.get(guildId);
        if (!player.playing || player.paused) return false;
        player.audioPlayer.pause(true);
        player.paused = true;
        musicService.setPaused(guildId, true);
        return true;
    }

    resume(guildId) {
        const player = this.get(guildId);
        if (!player.playing || !player.paused) return false;
        player.audioPlayer.unpause();
        player.paused = false;
        musicService.setPaused(guildId, false);
        return true;
    }

    async skip(guildId) {
        const player = this.get(guildId);
        player.audioPlayer.stop(true);
        return true;
    }

    stop(guildId) {
        const player = this.get(guildId);
        player.audioPlayer.stop(true);
        player.resource = null;
        player.playing = false;
        player.paused = false;
        player.current = null;
        player.startedAt = null;
        player.position = 0;
        musicQueue.clear(guildId);
        musicService.setPlaying(guildId, false);
        musicService.setPaused(guildId, false);
        musicService.setCurrentTrack(guildId, null);
        return true;
    }

    setVolume(guildId, volume) {
        const value = musicService.setVolume(guildId, volume);
        if (value === false) return false;

        const player = this.get(guildId);
        if (player.resource?.volume) {
            player.resource.volume.setVolume(value / 100);
        }

        return value;
    }

    getVolume(guildId) {
        return musicService.getVolume(guildId);
    }

    setLoop(guildId, mode) {
        return musicService.setLoop(guildId, mode);
    }

    getLoop(guildId) {
        return musicService.getLoop(guildId);
    }

    getCurrent(guildId) {
        return this.get(guildId).current;
    }

    getState(guildId) {
        const player = this.get(guildId);
        return {
            ...musicService.getState(guildId),
            playing: player.playing,
            paused: player.paused,
            current: player.current,
            startedAt: player.startedAt,
            position: player.position,
            voiceChannelId: musicService.getState(guildId).voiceChannelId
        };
    }

    reset(guildId) {
        this.stop(guildId);
        const connection = this.connections.get(guildId);
        connection?.destroy();
        this.connections.delete(guildId);
        this.players.delete(guildId);
        musicService.reset(guildId);
    }

    shutdown() {
        for (const connection of this.connections.values()) connection.destroy();
        this.connections.clear();
        for (const player of this.players.values()) {
            player.audioPlayer.stop(true);
            player.resource = null;
        }
        this.players.clear();
    }
}

export default new MusicPlayer();
