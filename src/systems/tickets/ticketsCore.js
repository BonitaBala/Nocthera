/**
 * ============================================================
 * Nocthera v1.1.0
 * Tickets Core
 * ============================================================
 */

import ticketsManager from "./ticketsManager.js";

class TicketsCore {

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

        await ticketsManager.initialize(client);

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

        await ticketsManager.shutdown();

        this.client = null;

        this.initialized = false;

    }

    /**
     * ========================================================
     * Configuration
     * ========================================================
     */

    getConfig(guildId) {

        return ticketsManager.getConfig(guildId);

    }

    setConfig(guildId, config) {

        return ticketsManager.setConfig(guildId, config);

    }

    /**
     * ========================================================
     * Tickets
     * ========================================================
     */

    createTicket(channelId, data) {

        return ticketsManager.createTicket(

            channelId,

            data

        );

    }

    getTicket(channelId) {

        return ticketsManager.getTicket(

            channelId

        );

    }

    closeTicket(channelId) {

        return ticketsManager.closeTicket(

            channelId

        );

    }

    getTicketsByUser(userId) {

        return ticketsManager.getTicketsByUser(

            userId

        );

    }

}

export default new TicketsCore();