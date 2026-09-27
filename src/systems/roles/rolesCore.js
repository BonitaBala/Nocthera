/**
 * ============================================================
 * Nocthera v1.1.0
 * Roles Core
 * ============================================================
 */

import rolesManager from "./rolesManager.js";

class RolesCore {

    constructor() {

        this.client = null;

        this.initialized = false;

    }

    /**
     * ========================================================
     * Initialize
     * ========================================================
     */

    async initialize(client) {

        if (this.initialized) {
            return;
        }

        this.client = client;

        await rolesManager.initialize(client);

        this.initialized = true;

    }

    /**
     * ========================================================
     * Start
     * ========================================================
     */

    async start() {

        // Reserved for future background tasks.

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        await rolesManager.shutdown();

        this.client = null;

        this.initialized = false;

    }

    /**
     * ========================================================
     * Create Panel
     * ========================================================
     */

    createPanel(guildId, panel) {

        return rolesManager.createPanel(guildId, panel);

    }

    /**
     * ========================================================
     * Remove Panel
     * ========================================================
     */

    removePanel(guildId, panelId) {

        return rolesManager.removePanel(guildId, panelId);

    }

    /**
     * ========================================================
     * Toggle Role
     * ========================================================
     */

    async toggleRole(member, roleId) {

        return rolesManager.toggleRole(member, roleId);

    }

    /**
     * ========================================================
     * Configuration
     * ========================================================
     */

    getConfig(guildId) {

        return rolesManager.getConfig(guildId);

    }

    setConfig(guildId, config) {

        return rolesManager.setConfig(guildId, config);

    }

}

export default new RolesCore();