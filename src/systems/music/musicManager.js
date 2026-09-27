/**
 * ============================================================
 * Nocthera v1.1.0
 * Music Manager
 * ============================================================
 */

import musicService from "./musicService.js";
import musicPlayer from "./musicPlayer.js";
import musicQueue from "./musicQueue.js";

class MusicManager {

    constructor() {

        this.client = null;

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        this.client = client;

        await musicService.initialize(client);

    }

    // ========================================================
    // Configuration
    // ========================================================

    getConfig(guildId) {

        return musicService.getConfig(guildId);

    }

    setConfig(guildId, config) {

        return musicService.setConfig(

            guildId,

            config

        );

    }

    // ========================================================
    // Voice / Text Channels
    // ========================================================

    setVoiceChannel(guildId, channelId) {

        return musicService.setVoiceChannel(

            guildId,

            channelId

        );

    }

    setTextChannel(guildId, channelId) {

        return musicService.setTextChannel(

            guildId,

            channelId

        );

    }

    // ========================================================
    // Queue
    // ========================================================

    add(guildId, track) {

        return musicQueue.add(

            guildId,

            track

        );

    }

    addMany(guildId, tracks) {

        return musicQueue.addMany(

            guildId,

            tracks

        );

    }

    remove(guildId, index) {

        return musicQueue.remove(

            guildId,

            index

        );

    }

    next(guildId) {

        return musicQueue.next(guildId);

    }

    peek(guildId) {

        return musicQueue.peek(guildId);

    }

    clear(guildId) {

        return musicQueue.clear(guildId);

    }

    shuffle(guildId) {

        return musicQueue.shuffle(guildId);

    }

    move(guildId, from, to) {

        return musicQueue.move(

            guildId,

            from,

            to

        );

    }

    getQueue(guildId) {

        return musicQueue.snapshot(guildId);

    }

    getQueueSize(guildId) {

        return musicQueue.size(guildId);

    }

    // ========================================================
    // Player
    // ========================================================

    async join(guildId, voiceChannel) {

        return musicPlayer.join(guildId, voiceChannel);

    }

    async play(guildId, track = null) {

        return musicPlayer.play(

            guildId,

            track

        );

    }

    pause(guildId) {

        return musicPlayer.pause(guildId);

    }

    resume(guildId) {

        return musicPlayer.resume(guildId);

    }

    async skip(guildId) {

        return musicPlayer.skip(guildId);

    }

    stop(guildId) {

        return musicPlayer.stop(guildId);

    }

    // ========================================================
    // Volume / Loop
    // ========================================================

    setVolume(guildId, volume) {

        return musicPlayer.setVolume(

            guildId,

            volume

        );

    }

    getVolume(guildId) {

        return musicPlayer.getVolume(guildId);

    }

    setLoop(guildId, mode) {

        return musicPlayer.setLoop(

            guildId,

            mode

        );

    }

    getLoop(guildId) {

        return musicPlayer.getLoop(guildId);

    }

    // ========================================================
    // State
    // ========================================================

    getCurrent(guildId) {

        return musicPlayer.getCurrent(

            guildId

        );

    }

    getState(guildId) {

        return musicPlayer.getState(

            guildId

        );

    }

    // ========================================================
    // Reset
    // ========================================================

    reset(guildId) {

        musicQueue.clear(guildId);

        musicPlayer.reset(guildId);

        musicService.reset(guildId);

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        musicPlayer.shutdown();

        musicQueue.shutdown();

        await musicService.shutdown();

        this.client = null;

    }

}

export default new MusicManager();