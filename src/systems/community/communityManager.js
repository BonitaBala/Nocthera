/**
 * ============================================================
 * Nocthera v1.1.0
 * Community Manager
 * ============================================================
 */

import communityService from "./communityService.js";

class CommunityManager {

    constructor() {

        this.client = null;

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        this.client = client;

        await communityService.initialize(client);

    }

    // ========================================================
    // Configuration
    // ========================================================

    getConfig(guildId) {

        return communityService.getConfig(guildId);

    }

    setConfig(guildId, config) {

        return communityService.setConfig(

            guildId,

            config

        );

    }

    // ========================================================
    // Community Actions
    // ========================================================

    async welcome(member) {

        return communityService.sendWelcome(member);

    }

    async goodbye(member) {

        return communityService.sendGoodbye(member);

    }

    async assignAutoRole(member) {

        return communityService.assignAutoRole(member);

    }

    async updateMemberCounter(guild) {

        return communityService.updateMemberCounter(guild);

    }

    async announce(guildId, content) {

        return communityService.announce(

            guildId,

            content

        );

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        await communityService.shutdown();

        this.client = null;

    }

}

export default new CommunityManager();