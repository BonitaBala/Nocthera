/**
 * ============================================================
 * Nocthera v1.1.0
 * Community Service
 * ============================================================
 */

import communityConfig from "./communityConfig.js";

class CommunityService {

    constructor() {

        this.client = null;

        this.guilds = new Map();

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        this.client = client;

    }

    // ========================================================
    // Configuration
    // ========================================================

    getConfig(guildId) {

        if (!this.guilds.has(guildId)) {

            this.guilds.set(

                guildId,

                communityConfig.create()

            );

        }

        return this.guilds.get(guildId);

    }

    setConfig(guildId, config) {

        const merged = communityConfig.merge(config);

        this.guilds.set(

            guildId,

            merged

        );

        return merged;

    }

    // ========================================================
    // Welcome
    // ========================================================

    async sendWelcome(member) {

        const config = this.getConfig(member.guild.id);

        if (!config.enabled || !config.welcome.enabled) {

            return false;

        }

        if (!config.welcome.channelId) {

            return false;

        }

        const channel = member.guild.channels.cache.get(

            config.welcome.channelId

        );

        if (!channel || !channel.isTextBased()) {

            return false;

        }

        const message = config.welcome.message

            .replaceAll("{user}", `<@${member.id}>`)

            .replaceAll("{username}", member.user.username)

            .replaceAll("{server}", member.guild.name);

        await channel.send({

            content: message

        });

        return true;

    }

    // ========================================================
    // Goodbye
    // ========================================================

    async sendGoodbye(member) {

        const config = this.getConfig(member.guild.id);

        if (!config.enabled || !config.goodbye.enabled) {

            return false;

        }

        if (!config.goodbye.channelId) {

            return false;

        }

        const channel = member.guild.channels.cache.get(

            config.goodbye.channelId

        );

        if (!channel || !channel.isTextBased()) {

            return false;

        }

        const message = config.goodbye.message

            .replaceAll("{user}", member.user.username)

            .replaceAll("{server}", member.guild.name);

        await channel.send({

            content: message

        });

        return true;

    }

    // ========================================================
    // Auto Role
    // ========================================================

    async assignAutoRole(member) {

        const config = this.getConfig(member.guild.id);

        if (!config.enabled || !config.autoRole.enabled) {

            return false;

        }

        if (!config.autoRole.roleId) {

            return false;

        }

        const role = member.guild.roles.cache.get(

            config.autoRole.roleId

        );

        if (!role || role.managed) {

            return false;

        }

        if (!member.guild.members.me.permissions.has("ManageRoles")) {

            return false;

        }

        if (

            role.position >=

            member.guild.members.me.roles.highest.position

        ) {

            return false;

        }

        await member.roles.add(role);

        return true;

    }

    // ========================================================
    // Member Counter
    // ========================================================

    async updateMemberCounter(guild) {

        const config = this.getConfig(guild.id);

        if (!config.enabled || !config.memberCounter.enabled) {

            return false;

        }

        if (!config.memberCounter.channelId) {

            return false;

        }

        const channel = guild.channels.cache.get(

            config.memberCounter.channelId

        );

        if (!channel) {

            return false;

        }

        const name = `Members: ${guild.memberCount}`;

        if (channel.manageable) {

            await channel.setName(name);

        }

        return true;

    }

    // ========================================================
    // Announcements
    // ========================================================

    async announce(guildId, content) {

        const config = this.getConfig(guildId);

        if (!config.enabled || !config.announcements.enabled) {

            return false;

        }

        if (!config.announcements.channelId) {

            return false;

        }

        const guild = this.client?.guilds.cache.get(guildId);

        if (!guild) {

            return false;

        }

        const channel = guild.channels.cache.get(

            config.announcements.channelId

        );

        if (!channel || !channel.isTextBased()) {

            return false;

        }

        await channel.send({

            content

        });

        return true;

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        this.guilds.clear();

        this.client = null;

    }

}

export default new CommunityService();