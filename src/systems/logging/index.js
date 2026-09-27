/**
 * ============================================================
 * Nocthera v1.1.0
 * Logging System
 * ============================================================
 */

import loggingCore from "./loggingCore.js";
import loggingManager from "./loggingManager.js";
import loggingService from "./loggingService.js";

class LoggingSystem {

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

        await loggingCore.initialize(client);

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

        await loggingCore.start();

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        await loggingCore.shutdown();

        this.client = null;

        this.initialized = false;

    }

    /**
     * ========================================================
     * Exposed API
     * ========================================================
     */

    get core() {

        return loggingCore;

    }

    get manager() {

        return loggingManager;

    }

    get service() {

        return loggingService;

    }

}

const logging = new LoggingSystem();

export {

    loggingCore,

    loggingManager,

    loggingService

};

export default logging;