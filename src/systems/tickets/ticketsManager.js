/**
 * ============================================================
 * Nocthera v1.1.0
 * Tickets Manager
 * ============================================================
 */

import ticketsService from "./ticketsService.js";

class TicketsManager {

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

        await ticketsService.initialize(client);

    }

    /**
     * ========================================================
     * Configuration
     * ========================================================
     */

    getConfig(guildId) {

        return ticketsService.get(guildId);

    }

    setConfig(guildId, config) {

        return ticketsService.set(guildId, config);

    }

    /**
     * ========================================================
     * Tickets
     * ========================================================
     */

    createTicket(channelId, data) {

        return ticketsService.createTicket(

            channelId,

            data

        );

    }

    getTicket(channelId) {

        return ticketsService.getTicket(

            channelId

        );

    }

    closeTicket(channelId) {

        return ticketsService.closeTicket(

            channelId

        );

    }

    getTicketsByUser(userId) {

        return ticketsService.getTicketsByUser(

            userId

        );

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        await ticketsService.shutdown();

        this.client = null;

    }

}

export default new TicketsManager();