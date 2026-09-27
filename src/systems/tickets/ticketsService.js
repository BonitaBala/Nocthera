/**
 * ============================================================
 * Nocthera v1.1.0
 * Tickets Service
 * ============================================================
 */

import ticketsConfig from "./ticketsConfig.js";

class TicketsService {

    constructor() {

        this.client = null;

        this.guilds = new Map();

        this.tickets = new Map();

    }

    /**
     * ========================================================
     * Initialize
     * ========================================================
     */

    async initialize(client) {

        this.client = client;

    }

    /**
     * ========================================================
     * Configuration
     * ========================================================
     */

    get(guildId) {

        if (!this.guilds.has(guildId)) {

            this.guilds.set(

                guildId,

                ticketsConfig.create()

            );

        }

        return this.guilds.get(guildId);

    }

    set(guildId, config) {

        const merged = ticketsConfig.merge(config);

        this.guilds.set(

            guildId,

            merged

        );

        return merged;

    }

    /**
     * ========================================================
     * Tickets
     * ========================================================
     */

    createTicket(channelId, data) {

        this.tickets.set(

            channelId,

            {

                createdAt: Date.now(),

                ...data

            }

        );

        return this.tickets.get(channelId);

    }

    getTicket(channelId) {

        return this.tickets.get(channelId) ?? null;

    }

    closeTicket(channelId) {

        const ticket = this.getTicket(channelId);

        if (!ticket) {

            return false;

        }

        this.tickets.delete(channelId);

        return true;

    }

    getTicketsByUser(userId) {

        return [...this.tickets.values()].filter(

            ticket => ticket.ownerId === userId

        );

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        this.guilds.clear();

        this.tickets.clear();

        this.client = null;

    }

}

export default new TicketsService();