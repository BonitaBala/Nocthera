/**
 * ============================================================
 * Nocthera v1.1.0
 * Community Configuration
 * ============================================================
 */

class CommunityConfig {

    constructor() {

        this.defaults = {

            enabled: true,

            welcome: {

                enabled: false,

                channelId: null,

                message: "Welcome {user} to {server}!"

            },

            goodbye: {

                enabled: false,

                channelId: null,

                message: "{user} has left the server."

            },

            autoRole: {

                enabled: false,

                roleId: null

            },

            memberCounter: {

                enabled: false,

                channelId: null

            },

            announcements: {

                enabled: true,

                channelId: null

            },

            leveling: {

                enabled: false,

                enabledChannels: [],

                excludedChannels: []

            }

        };

    }

    create() {

        return structuredClone(this.defaults);

    }

    merge(config = {}) {

        const defaults = this.create();

        return {

            ...defaults,

            ...config,

            welcome: {

                ...defaults.welcome,

                ...(config.welcome ?? {})

            },

            goodbye: {

                ...defaults.goodbye,

                ...(config.goodbye ?? {})

            },

            autoRole: {

                ...defaults.autoRole,

                ...(config.autoRole ?? {})

            },

            memberCounter: {

                ...defaults.memberCounter,

                ...(config.memberCounter ?? {})

            },

            announcements: {

                ...defaults.announcements,

                ...(config.announcements ?? {})

            },

            leveling: {

                ...defaults.leveling,

                ...(config.leveling ?? {})

            }

        };

    }

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

export default new CommunityConfig();