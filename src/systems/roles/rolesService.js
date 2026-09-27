/**
 * ============================================================
 * Nocthera v1.1.0
 * Roles Service
 * ============================================================
 */

import rolesConfig from "./rolesConfig.js";

class RolesService {

    constructor() {

        this.client = null;

        this.guilds = new Map();

    }

    /**
     * ========================================================
     * Initialize
     * ========================================================
     */

    async initialize(client) {

        this.client = client;

    }

    /**
     * ========================================================
     * Get Configuration
     * ========================================================
     */

    get(guildId) {

        if (!this.guilds.has(guildId)) {

            this.guilds.set(

                guildId,

                rolesConfig.create()

            );

        }

        return this.guilds.get(guildId);

    }

    /**
     * ========================================================
     * Update Configuration
     * ========================================================
     */

    set(guildId, config) {

        const merged = rolesConfig.merge(config);

        this.guilds.set(

            guildId,

            merged

        );

        return merged;

    }

    /**
     * ========================================================
     * Enable
     * ========================================================
     */

    enable(guildId) {

        const config = this.get(guildId);

        config.enabled = true;

        return config;

    }

    /**
     * ========================================================
     * Disable
     * ========================================================
     */

    disable(guildId) {

        const config = this.get(guildId);

        config.enabled = false;

        return config;

    }

    /**
     * ========================================================
     * Create Panel
     * ========================================================
     */

    createPanel(guildId, panel) {

        const config = this.get(guildId);

        config.panels.push(panel);

        return panel;

    }

    /**
     * ========================================================
     * Remove Panel
     * ========================================================
     */

    removePanel(guildId, panelId) {

        const config = this.get(guildId);

        config.panels = config.panels.filter(

            panel => panel.id !== panelId

        );

    }

    /**
     * ========================================================
     * Get Panel
     * ========================================================
     */

    getPanel(guildId, panelId) {

        return this.get(guildId).panels.find(

            panel => panel.id === panelId

        );

    }

    /**
     * ========================================================
     * Toggle Role
     * ========================================================
     */

    async toggleRole(member, roleId) {

        const role = member.guild.roles.cache.get(roleId);

        if (!role) {

            return false;

        }

        if (member.roles.cache.has(roleId)) {

            await member.roles.remove(role);

            return "removed";

        }

        await member.roles.add(role);

        return "added";

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        this.guilds.clear();

        this.client = null;

    }

}

export default new RolesService();