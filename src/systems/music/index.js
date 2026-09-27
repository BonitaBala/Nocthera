/**
 * ============================================================
 * Nocthera v1.1.0
 * Music System
 * ============================================================
 */

import musicService from "./musicService.js";
import musicManager from "./musicManager.js";
import musicPlayer from "./musicPlayer.js";
import musicQueue from "./musicQueue.js";
import musicHandler from "./musicHandler.js";

class MusicSystem {

    constructor() {

        this.client = null;

        this.initialized = false;

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        if (this.initialized) {

            return;

        }

        this.client = client;

        await musicManager.initialize(client);

        this.initialized = true;

    }

    // ========================================================
    // Start
    // ========================================================

    async start() {

        if (!this.initialized) {

            return;

        }

        await musicService.start();

    }

    // ========================================================
    // Interaction Handler
    // ========================================================

    async handleInteraction(interaction) {

        return musicHandler.handleInteraction(

            interaction

        );

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        musicPlayer.shutdown();

        musicQueue.shutdown();

        await musicService.shutdown();

        this.client = null;

        this.initialized = false;

    }

    // ========================================================
    // Accessors
    // ========================================================

    get service() {

        return musicService;

    }

    get manager() {

        return musicManager;

    }

    get player() {

        return musicPlayer;

    }

    get queue() {

        return musicQueue;

    }

    get handler() {

        return musicHandler;

    }

}

const music = new MusicSystem();

export {

    musicService,

    musicManager,

    musicPlayer,

    musicQueue,

    musicHandler

};

export default music;