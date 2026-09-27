/**
 * ============================================================
 * Nocthera v1.1.0
 * Embed Configuration
 * ============================================================
 */

class EmbedConfig {

    constructor() {

        this.defaults = {

            enabled: true,

            maxFields: 25,

            maxDescription: 4096,

            maxTitle: 256,

            maxFooter: 2048,

            maxAuthor: 256,

            maxColor: 0x5865F2,

            allowImages: true,

            allowThumbnails: true,

            allowFooter: true,

            allowAuthor: true,

            allowTimestamp: true,

            templatesEnabled: true,

            importExportEnabled: true

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

            ...config

        };

    }

    validate(config) {

        if (!config || typeof config !== "object") {

            return false;

        }

        if (typeof config.enabled !== "boolean") {

            return false;

        }

        if (typeof config.maxFields !== "number") {

            return false;

        }

        return true;

    }

}

export default new EmbedConfig();