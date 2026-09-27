/**
 * ============================================================
 * Nocthera v1.1.0
 * AI System
 * ============================================================
 */

import aiCore from "./aiCore.js";
import aiManager from "./aiManager.js";
import aiService from "./aiService.js";

class AISystem {

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

        await aiCore.initialize(client);

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

        await aiCore.start();

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        await aiCore.shutdown();

        this.client = null;

        this.initialized = false;

    }

    /**
     * ========================================================
     * Public API
     * ========================================================
     */

    get core() {

        return aiCore;

    }

    get manager() {

        return aiManager;

    }

    get service() {

        return aiService;

    }

}

const ai = new AISystem();

export {

    aiCore,

    aiManager,

    aiService

};

export default ai;