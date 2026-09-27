/**
 * ============================================================
 * Nocthera v1.1.0
 * Music Configuration
 * ============================================================
 */

class MusicConfig {

    constructor() {

        this.defaults = {

            enabled: true,

            volume: 80,

            maxQueueSize: 100,

            leaveOnEmpty: true,

            leaveDelay: 30000,

            autoplay: false,

            loop: "off",

            announceNowPlaying: true,

            announceChannelId: null,

            djRoleId: null,

            allowedChannels: [],

            blockedChannels: []

        };

    }

    create() {

        return structuredClone(
            this.defaults
        );

    }

    merge(config = {}) {

        return {

            ...this.create(),

            ...config,

            allowedChannels:
                Array.isArray(config.allowedChannels)
                    ? [...config.allowedChannels]
                    : [...this.defaults.allowedChannels],

            blockedChannels:
                Array.isArray(config.blockedChannels)
                    ? [...config.blockedChannels]
                    : [...this.defaults.blockedChannels]

        };

    }

    validate(config) {

        if (!config || typeof config !== "object") {

            return false;

        }

        if (typeof config.enabled !== "boolean") {

            return false;

        }

        if (
            typeof config.volume !== "number" ||
            config.volume < 0 ||
            config.volume > 100
        ) {

            return false;

        }

        if (
            typeof config.maxQueueSize !== "number" ||
            config.maxQueueSize < 1
        ) {

            return false;

        }

        if (
            !["off", "track", "queue"].includes(
                config.loop
            )
        ) {

            return false;

        }

        return true;

    }

}

export default new MusicConfig();