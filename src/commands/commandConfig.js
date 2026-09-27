/**
 * ============================================================
 * Nocthera v1.1.0
 * Command Configuration
 * ============================================================
 */

class CommandConfig {

    constructor() {

        this.defaults = {

            enabled: true,

            registration: {

                global: true,

                guildOnly: false

            },

            limits: {

                maxCommands: 100,

                cooldown: 3000

            },

            permissions: {

                default: "SendMessages",

                administratorCommands: [

                    "setup",

                    "config",

                    "security"

                ]

            },

            categories: [

                "core",

                "setup",

                "moderation",

                "security",

                "verification",

                "roles",

                "embeds",

                "tickets",

                "music",

                "community",

                "logging"

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

            registration: {

                ...defaults.registration,

                ...(config.registration ?? {})

            },

            limits: {

                ...defaults.limits,

                ...(config.limits ?? {})

            },

            permissions: {

                ...defaults.permissions,

                ...(config.permissions ?? {})

            },

            categories:

                Array.isArray(config.categories)

                    ? [...config.categories]

                    : [...defaults.categories]

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
            typeof config.limits?.maxCommands !==
            "number" ||
            config.limits.maxCommands < 1
        ) {

            return false;

        }

        if (
            typeof config.limits?.cooldown !==
            "number" ||
            config.limits.cooldown < 0
        ) {

            return false;

        }

        if (
            !Array.isArray(
                config.categories
            )
        ) {

            return false;

        }

        return true;

    }

}

export default new CommandConfig();