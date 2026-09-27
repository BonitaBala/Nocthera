/**
 * ============================================================
 * Nocthera v1.1.0
 * Moderation Service
 * ============================================================
 */

import moderationConfig from "./moderationConfig.js";

class ModerationService {

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
     * Configuration
     * ========================================================
     */

    get(guildId) {

        if (!this.guilds.has(guildId)) {

            this.guilds.set(

                guildId,

                moderationConfig.create()

            );

        }

        return this.guilds.get(guildId);

    }

    set(guildId, config) {

        const merged = moderationConfig.merge(config);

        this.guilds.set(

            guildId,

            merged

        );

        return merged;

    }

    /**
     * ========================================================
     * Warn
     * ========================================================
     */

    async warn(member, reason = "No reason provided.") {

        return {

            action: "warn",

            member,

            reason

        };

    }

    /**
     * ========================================================
     * Timeout
     * ========================================================
     */

    async timeout(member, duration, reason = "No reason provided.") {

        await member.timeout(duration, reason);

        return true;

    }

    /**
     * ========================================================
     * Kick
     * ========================================================
     */

    async kick(member, reason = "No reason provided.") {

        await member.kick(reason);

        return true;

    }

    /**
     * ========================================================
     * Ban
     * ========================================================
     */

    async ban(member, reason = "No reason provided.", deleteMessageSeconds = 86400) {

        await member.ban({

            reason,

            deleteMessageSeconds

        });

        return true;

    }

    /**
     * ========================================================
     * Unban
     * ========================================================
     */

    async unban(guild, userId, reason = "No reason provided.") {

        await guild.members.unban(

            userId,

            reason

        );

        return true;

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

export default new ModerationService();