/**
 * ============================================================
 * Nocthera v1.1.0
 * Logging Manager
 * ============================================================
 */

import loggingService from "./loggingService.js";

class LoggingManager {

    constructor() {

        this.client = null;

    }

    /**
     * ========================================================
     * Initialize
     * ========================================================
     */

    async initialize(client) {

        this.client = client;

        await loggingService.initialize(client);

    }

    /**
     * ========================================================
     * Configuration
     * ========================================================
     */

    getConfig(guildId) {

        return loggingService.get(guildId);

    }

    setConfig(guildId, config) {

        return loggingService.set(guildId, config);

    }

    /**
     * ========================================================
     * Logging
     * ========================================================
     */

    async send(guild, type, options) {

        return loggingService.send(

            guild,

            type,

            options

        );

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        await loggingService.shutdown();

        this.client = null;

    }

}

export default new LoggingManager();