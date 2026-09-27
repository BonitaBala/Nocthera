/**
 * ============================================================
 * Nocthera v1.1.0
 * Community Core
 * ============================================================
 */

import communityManager from "./communityManager.js";

class CommunityCore {

    constructor() {

        this.client = null;

        this.initialized = false;

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        if (this.initialized) {

            return;

        }

        this.client = client;

        await communityManager.initialize(client);

        this.initialized = true;

    }

    // ========================================================
    // Start
    // ========================================================

    async start() {

        if (!this.initialized) {

            return;

        }

        for (const guild of this.client.guilds.cache.values()) {

            await this.initializeGuild(guild);

        }

    }

    // ========================================================
    // Guild Initialization
    // ========================================================

    async initializeGuild(guild) {

        if (!guild) {

            return false;

        }

        communityManager.getConfig(guild.id);

        return true;

    }

    // ========================================================
    // Member Join
    // ========================================================

    async handleMemberJoin(member) {

        if (!member?.guild) {

            return;

        }

        await communityManager.welcome(member);

        await communityManager.assignAutoRole(member);

        await communityManager.updateMemberCounter(

            member.guild

        );

    }

    // ========================================================
    // Member Leave
    // ========================================================

    async handleMemberLeave(member) {

        if (!member?.guild) {

            return;

        }

        await communityManager.goodbye(member);

        await communityManager.updateMemberCounter(

            member.guild

        );

    }

    // ========================================================
    // Guild Create
    // ========================================================

    async handleGuildCreate(guild) {

        return this.initializeGuild(guild);

    }

    // ========================================================
    // Guild Delete
    // ========================================================

    async handleGuildDelete(guild) {

        if (!guild) {

            return;

        }

        return true;

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        await communityManager.shutdown();

        this.client = null;

        this.initialized = false;

    }

}

export default new CommunityCore();