/**
 * ============================================================
 * Nocthera v1.1.0
 * Moderation System
 * ============================================================
 */

import moderationCore from "./moderationCore.js";
import moderationManager from "./moderationManager.js";
import moderationService from "./moderationService.js";

class ModerationSystem {

    constructor() {

        this.client = null;

        this.initialized = false;

    }

    /**
     * ========================================================
     * Initialize
     * ========================================================
     */

    async initialize(client) {

        if (this.initialized) {
            return;
        }

        this.client = client;

        await moderationCore.initialize(client);

        this.initialized = true;

    }

    /**
     * ========================================================
     * Start
     * ========================================================
     */

    async start() {

        if (!this.initialized) {
            return;
        }

        await moderationCore.start();

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        await moderationCore.shutdown();

        this.client = null;

        this.initialized = false;

    }

    /**
     * ========================================================
     * Exposed API
     * ========================================================
     */

    get core() {

        return moderationCore;

    }

    get manager() {

        return moderationManager;

    }

    get service() {

        return moderationService;

    }

}

const moderation = new ModerationSystem();

export {

    moderationCore,

    moderationManager,

    moderationService

};

export default moderation;