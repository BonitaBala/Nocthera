/**
 * ============================================================
 * Nocthera v1.1.0
 * Moderation Configuration
 * ============================================================
 */

class ModerationConfig {

    constructor() {

        this.defaults = {

            enabled: true,

            logChannel: null,

            moderatorRole: null,

            muteRole: null,

            dmUser: true,

            reasonRequired: true,

            defaultDeleteDays: 1,

            warnLimit: 3,

            timeoutLimit: 5,

            autoEscalation: false

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

            ...config

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

        return true;

    }

}

export default new ModerationConfig();