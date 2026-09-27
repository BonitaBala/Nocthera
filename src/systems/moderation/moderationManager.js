/**
 * ============================================================
 * Nocthera v1.1.0
 * Moderation Manager
 * ============================================================
 */

import moderationService from "./moderationService.js";

class ModerationManager {

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

        await moderationService.initialize(client);

    }

    /**
     * ========================================================
     * Configuration
     * ========================================================
     */

    getConfig(guildId) {

        return moderationService.get(guildId);

    }

    setConfig(guildId, config) {

        return moderationService.set(guildId, config);

    }

    /**
     * ========================================================
     * Moderation Actions
     * ========================================================
     */

    async warn(member, reason) {

        return moderationService.warn(member, reason);

    }

    async timeout(member, duration, reason) {

        return moderationService.timeout(

            member,

            duration,

            reason

        );

    }

    async kick(member, reason) {

        return moderationService.kick(

            member,

            reason

        );

    }

    async ban(member, reason, deleteMessageSeconds) {

        return moderationService.ban(

            member,

            reason,

            deleteMessageSeconds

        );

    }

    async unban(guild, userId, reason) {

        return moderationService.unban(

            guild,

            userId,

            reason

        );

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        await moderationService.shutdown();

        this.client = null;

    }

}

export default new ModerationManager();