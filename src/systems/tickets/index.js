/**
 * ============================================================
 * Nocthera v1.1.0
 * Tickets System
 * ============================================================
 */

import ticketsCore from "./ticketsCore.js";
import ticketsManager from "./ticketsManager.js";
import ticketsService from "./ticketsService.js";

class TicketsSystem {

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

        await ticketsCore.initialize(client);

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

        await ticketsCore.start();

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        await ticketsCore.shutdown();

        this.client = null;

        this.initialized = false;

    }

    /**
     * ========================================================
     * Exposed API
     * ========================================================
     */

    get core() {

        return ticketsCore;

    }

    get manager() {

        return ticketsManager;

    }

    get service() {

        return ticketsService;

    }

}

const tickets = new TicketsSystem();

export {

    ticketsCore,

    ticketsManager,

    ticketsService

};

export default tickets;