/**
 * ============================================================
 * Nocthera v1.1.0
 * Tickets Configuration
 * ============================================================
 */

class TicketsConfig {

    constructor() {

        this.defaults = {

            enabled: true,

            categoryId: null,

            logChannelId: null,

            transcriptChannelId: null,

            supportRoles: [],

            maxTicketsPerUser: 1,

            closeAfterHours: 24,

            createTranscript: true,

            deleteAfterClose: false

        };

    }

    /**
     * ========================================================
     * Create Default Configuration
     * ========================================================
     */

    create() {

        return structuredClone(this.defaults);

    }

    /**
     * ========================================================
     * Merge Configuration
     * ========================================================
     */

    merge(config = {}) {

        return {

            ...this.create(),

            ...config,

            supportRoles: Array.isArray(config.supportRoles)

                ? config.supportRoles

                : []

        };

    }

    /**
     * ========================================================
     * Validate Configuration
     * ========================================================
     */

    validate(config) {

        if (!config || typeof config !== "object") {

            return false;

        }

        if (typeof config.enabled !== "boolean") {

            return false;

        }

        if (!Array.isArray(config.supportRoles)) {

            return false;

        }

        return true;

    }

}

export default new TicketsConfig();