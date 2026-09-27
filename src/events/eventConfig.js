/**
 * ============================================================
 * Nocthera v1.1.0
 * Event Configuration
 * ============================================================
 */

class EventConfig {

    constructor() {

        this.defaults = {

            enabled: true,

            logging: true,

            errorHandling: true,

            autoRegister: true,

            ignoredEvents: [],

            criticalEvents: [

                "clientReady",

                "interactionCreate",

                "guildCreate",

                "guildDelete",

                "error",

                "warn"

            ]

        };

    }

    create() {

        return structuredClone(

            this.defaults

        );

    }

    merge(config = {}) {

        const defaults = this.create();

        return {

            ...defaults,

            ...config,

            ignoredEvents:

                Array.isArray(config.ignoredEvents)

                    ? [...config.ignoredEvents]

                    : [...defaults.ignoredEvents],

            criticalEvents:

                Array.isArray(config.criticalEvents)

                    ? [...config.criticalEvents]

                    : [...defaults.criticalEvents]

        };

    }

    validate(config) {

        if (!config || typeof config !== "object") {

            return false;

        }

        if (
            typeof config.enabled !==
            "boolean"
        ) {

            return false;

        }

        if (
            typeof config.logging !==
            "boolean"
        ) {

            return false;

        }

        if (
            !Array.isArray(config.ignoredEvents)
        ) {

            return false;

        }

        if (
            !Array.isArray(config.criticalEvents)
        ) {

            return false;

        }

        return true;

    }

}

export default new EventConfig();