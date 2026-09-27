/**
 * ============================================================
 * Nocthera v1.1.0
 * Roles Configuration
 * ============================================================
 */

class RolesConfig {

    constructor() {

        this.defaults = {

            enabled: false,

            panels: []

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

            panels: Array.isArray(config.panels)

                ? config.panels

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

        if (!Array.isArray(config.panels)) {

            return false;

        }

        return true;

    }

}

export default new RolesConfig();