/**
 * ============================================================
 * Nocthera v1.1.0
 * Embed Manager
 * ============================================================
 */

import embedService from "./embedService.js";

class EmbedManager {

    constructor() {

        this.client = null;

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        this.client = client;

        await embedService.initialize(client);

    }

    // ========================================================
    // Configuration
    // ========================================================

    getConfig(guildId) {

        return embedService.getConfig(guildId);

    }

    setConfig(guildId, config) {

        return embedService.setConfig(

            guildId,

            config

        );

    }

    // ========================================================
    // Embed Operations
    // ========================================================

    create(data = {}) {

        return embedService.create(data);

    }

    validate(data = {}) {

        return embedService.validate(data);

    }

    // ========================================================
    // Templates
    // ========================================================

    saveTemplate(guildId, name, data) {

        return embedService.saveTemplate(

            guildId,

            name,

            data

        );

    }

    getTemplate(guildId, name) {

        return embedService.getTemplate(

            guildId,

            name

        );

    }

    deleteTemplate(guildId, name) {

        return embedService.deleteTemplate(

            guildId,

            name

        );

    }

    listTemplates(guildId) {

        return embedService.listTemplates(guildId);

    }

    // ========================================================
    // Import / Export
    // ========================================================

    export(data) {

        return embedService.export(data);

    }

    import(data) {

        return embedService.import(data);

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        await embedService.shutdown();

        this.client = null;

    }

}

export default new EmbedManager();