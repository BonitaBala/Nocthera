/**
 * ============================================================
 * Nocthera v1.1.0
 * Logging Configuration
 * ============================================================
 */

class LoggingConfig {

    constructor() {

        this.defaults = {

            enabled: true,

            channels: {

                moderation: null,

                security: null,

                members: null,

                messages: null,

                server: null,

                voice: null

            },

            events: {

                moderation: true,

                security: true,

                members: true,

                messages: true,

                server: true,

                voice: false

            }

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

            channels: {

                ...this.defaults.channels,

                ...(config.channels || {})

            },

            events: {

                ...this.defaults.events,

                ...(config.events || {})

            }

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

export default new LoggingConfig();