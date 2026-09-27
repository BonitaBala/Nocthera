/**
 * ============================================================
 * Nocthera v1.1.0
 * Roles Manager
 * ============================================================
 */

import rolesService from "./rolesService.js";

class RolesManager {

    constructor() {

        this.client = null;

    }

    /**
     * ========================================================
     * Initialize
     * ========================================================
     */

    async initialize(client) {

        this.client = client;

        await rolesService.initialize(client);

    }

    /**
     * ========================================================
     * Create Panel
     * ========================================================
     */

    createPanel(guildId, panel) {

        return rolesService.createPanel(guildId, panel);

    }

    /**
     * ========================================================
     * Remove Panel
     * ========================================================
     */

    removePanel(guildId, panelId) {

        return rolesService.removePanel(guildId, panelId);

    }

    /**
     * ========================================================
     * Get Panel
     * ========================================================
     */

    getPanel(guildId, panelId) {

        return rolesService.getPanel(guildId, panelId);

    }

    /**
     * ========================================================
     * Get Configuration
     * ========================================================
     */

    getConfig(guildId) {

        return rolesService.get(guildId);

    }

    /**
     * ========================================================
     * Update Configuration
     * ========================================================
     */

    setConfig(guildId, config) {

        return rolesService.set(guildId, config);

    }

    /**
     * ========================================================
     * Toggle Role
     * ========================================================
     */

    async toggleRole(member, roleId) {

        return rolesService.toggleRole(member, roleId);

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        await rolesService.shutdown();

        this.client = null;

    }

}

export default new RolesManager();