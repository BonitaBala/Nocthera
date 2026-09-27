/**
 * ============================================================
 * Nocthera v1.1.0
 * Logging Core
 * ============================================================
 */

import loggingManager from "./loggingManager.js";

class LoggingCore {

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

        await loggingManager.initialize(client);

        this.initialized = true;

    }

    /**
     * ========================================================
     * Start
     * ========================================================
     */

    async start() {

        // Reserved for future background tasks.

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        await loggingManager.shutdown();

        this.client = null;

        this.initialized = false;

    }

    /**
     * ========================================================
     * Configuration
     * ========================================================
     */

    getConfig(guildId) {

        return loggingManager.getConfig(guildId);

    }

    setConfig(guildId, config) {

        return loggingManager.setConfig(guildId, config);

    }

    /**
     * ========================================================
     * Logging
     * ========================================================
     */

    async send(guild, type, options) {

        return loggingManager.send(

            guild,

            type,

            options

        );

    }

}

export default new LoggingCore();