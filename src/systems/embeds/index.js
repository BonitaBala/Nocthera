/**
 * ============================================================
 * Nocthera v1.1.0
 * Embeds System
 * ============================================================
 */

import embedService from "./embedService.js";
import embedManager from "./embedManager.js";
import embedBuilder from "./embedBuilder.js";
import embedTemplates from "./embedTemplates.js";
import embedHandler from "./embedHandler.js";

class EmbedsSystem {

    constructor() {

        this.client = null;

        this.initialized = false;

    }

    async initialize(client) {

        if (this.initialized) {

            return;

        }

        this.client = client;

        await embedManager.initialize(client);

        this.initialized = true;

    }

    async start() {

        if (!this.initialized) {

            return;

        }

        await embedService.start();

    }

    async handleInteraction(interaction) {

        return embedHandler.handleInteraction(

            interaction

        );

    }

    async shutdown() {

        await embedService.shutdown();

        embedBuilder.clear();

        this.client = null;

        this.initialized = false;

    }

    get service() {

        return embedService;

    }

    get manager() {

        return embedManager;

    }

    get builder() {

        return embedBuilder;

    }

    get templates() {

        return embedTemplates;

    }

    get handler() {

        return embedHandler;

    }

}

const embeds = new EmbedsSystem();

export {

    embedService,

    embedManager,

    embedBuilder,

    embedTemplates,

    embedHandler

};

export default embeds;