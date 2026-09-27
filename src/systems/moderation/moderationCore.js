/**
 * ============================================================
 * Nocthera v1.1.0
 * Moderation Core
 * ============================================================
 */

import moderationManager from "./moderationManager.js";

class ModerationCore {

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

        await moderationManager.initialize(client);

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

        await moderationManager.shutdown();

        this.client = null;

        this.initialized = false;

    }

    /**
     * ========================================================
     * Configuration
     * ========================================================
     */

    getConfig(guildId) {

        return moderationManager.getConfig(guildId);

    }

    setConfig(guildId, config) {

        return moderationManager.setConfig(guildId, config);

    }

    /**
     * ========================================================
     * Moderation Actions
     * ========================================================
     */

    async warn(member, reason) {

        return moderationManager.warn(member, reason);

    }

    async timeout(member, duration, reason) {

        return moderationManager.timeout(

            member,

            duration,

            reason

        );

    }

    async kick(member, reason) {

        return moderationManager.kick(

            member,

            reason

        );

    }

    async ban(member, reason, deleteMessageSeconds) {

        return moderationManager.ban(

            member,

            reason,

            deleteMessageSeconds

        );

    }

    async unban(guild, userId, reason) {

        return moderationManager.unban(

            guild,

            userId,

            reason

        );

    }

}

export default new ModerationCore();