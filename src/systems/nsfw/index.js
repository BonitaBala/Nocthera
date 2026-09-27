/**
 * ============================================================
 * Nocthera v1.1.0
 * NSFW System
 * ============================================================
 */

import nsfwConfig from "./nsfwConfig.js";
import nsfwService from "./nsfwService.js";
import nsfwManager from "./nsfwManager.js";
import nsfwHandler from "./nsfwHandler.js";

class NsfwSystem {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    async initialize(client) {
        if (this.initialized) return;

        this.client = client;
        await nsfwManager.initialize(client);
        this.initialized = true;
    }

    async start() {
        // nothing extra
    }

    async handleInteraction(interaction) {
        return nsfwHandler.handleInteraction(interaction);
    }

    async handleMessage(message) {
        return nsfwHandler.handleMessage(message);
    }

    async shutdown() {
        this.client = null;
        this.initialized = false;
        nsfwConfig.clearCache();
    }

    get config() {
        return nsfwConfig;
    }

    get service() {
        return nsfwService;
    }

    get manager() {
        return nsfwManager;
    }

    get handler() {
        return nsfwHandler;
    }
}

const nsfw = new NsfwSystem();

export {
    nsfwConfig,
    nsfwService,
    nsfwManager,
    nsfwHandler
};

export default nsfw;
