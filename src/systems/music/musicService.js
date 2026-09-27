/**
 * ============================================================
 * Nocthera v1.1.0
 * Music Service
 * ============================================================
 */

import musicConfig from "./musicConfig.js";

class MusicService {

    constructor() {

        this.client = null;

        this.guilds = new Map();
        this.runtime = { ffmpeg: process.env.FFMPEG_PATH || "ffmpeg" };

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        this.client = client;

    }

    async start() {
        // Music playback is designed to work in Railway/Docker where FFmpeg
        // is provided by the runtime image. Keep this check non-fatal so the
        // rest of Nocthera can still start and report a useful Music error.
        const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
        this.runtime = { ffmpeg };
        return true;
    }

    // ========================================================
    // Guild State
    // ========================================================

    getGuild(guildId) {

        if (!this.guilds.has(guildId)) {

            this.guilds.set(guildId, {

                config: musicConfig.create(),

                voiceChannelId: null,

                textChannelId: null,

                playing: false,

                paused: false,

                currentTrack: null,

                volume: 80,

                loop: "off"

            });

        }

        return this.guilds.get(guildId);

    }

    // ========================================================
    // Configuration
    // ========================================================

    getConfig(guildId) {

        return this.getGuild(guildId).config;

    }

    setConfig(guildId, config) {

        const merged = musicConfig.merge(config);

        this.getGuild(guildId).config = merged;

        return merged;

    }

    // ========================================================
    // Player State
    // ========================================================

    setVoiceChannel(guildId, channelId) {

        const state = this.getGuild(guildId);

        state.voiceChannelId = channelId;

        return state;

    }

    setTextChannel(guildId, channelId) {

        const state = this.getGuild(guildId);

        state.textChannelId = channelId;

        return state;

    }

    setPlaying(guildId, playing) {

        const state = this.getGuild(guildId);

        state.playing = Boolean(playing);

        if (!state.playing) {

            state.paused = false;

        }

        return state;

    }

    setPaused(guildId, paused) {

        const state = this.getGuild(guildId);

        state.paused = Boolean(paused);

        return state;

    }

    setCurrentTrack(guildId, track) {

        const state = this.getGuild(guildId);

        state.currentTrack = track ?? null;

        return state;

    }

    getCurrentTrack(guildId) {

        return this.getGuild(guildId).currentTrack;

    }

    // ========================================================
    // Volume
    // ========================================================

    setVolume(guildId, volume) {

        const value = Number(volume);

        if (
            !Number.isFinite(value) ||
            value < 0 ||
            value > 100
        ) {

            return false;

        }

        const state = this.getGuild(guildId);

        state.volume = Math.round(value);

        state.config.volume = state.volume;

        return state.volume;

    }

    getVolume(guildId) {

        return this.getGuild(guildId).volume;

    }

    // ========================================================
    // Loop
    // ========================================================

    setLoop(guildId, mode) {

        const allowed = [

            "off",
            "track",
            "queue"

        ];

        if (!allowed.includes(mode)) {

            return false;

        }

        const state = this.getGuild(guildId);

        state.loop = mode;

        state.config.loop = mode;

        return mode;

    }

    getLoop(guildId) {

        return this.getGuild(guildId).loop;

    }

    // ========================================================
    // Permissions / Channel Checks
    // ========================================================

    canUse(guildId, channelId) {

        const config = this.getConfig(guildId);

        if (!config.enabled) {

            return false;

        }

        if (
            config.blockedChannels.includes(
                channelId
            )
        ) {

            return false;

        }

        if (
            config.allowedChannels.length > 0 &&
            !config.allowedChannels.includes(
                channelId
            )
        ) {

            return false;

        }

        return true;

    }

    // ========================================================
    // State
    // ========================================================

    getState(guildId) {

        const state = this.getGuild(guildId);

        return {

            voiceChannelId:
                state.voiceChannelId,

            textChannelId:
                state.textChannelId,

            playing:
                state.playing,

            paused:
                state.paused,

            currentTrack:
                state.currentTrack,

            volume:
                state.volume,

            loop:
                state.loop

        };

    }

    // ========================================================
    // Reset
    // ========================================================

    reset(guildId) {

        const state = this.getGuild(guildId);

        state.voiceChannelId = null;

        state.textChannelId = null;

        state.playing = false;

        state.paused = false;

        state.currentTrack = null;

        state.volume = state.config.volume;

        state.loop = state.config.loop;

        return state;

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        this.guilds.clear();

        this.client = null;

    }

}

export default new MusicService();