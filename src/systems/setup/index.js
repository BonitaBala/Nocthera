import setupConfig from "../setupConfig.js";
import security from "../security/index.js";
import moderation from "../moderation/index.js";
import logger from "../../core/logger.js";

class SetupSystem {
    constructor() {
        this.activity = new Map();
        this.client = null;
    }

    get config() { return setupConfig; }

    async initialize(client) {
        this.client = client ?? this.client;
        await setupConfig.ensureTable();
        return true;
    }

    async get(guildId) { return setupConfig.get(guildId); }

    async quickSecure(guildId) {
        const config = await setupConfig.set(guildId, {
            enabled: true,
            quickSecureApplied: true,
            security: { antiRaid: true, antiSpam: true, antiBot: true, antiNuke: true, logging: true },
            moderation: { enabled: true },
            monitoring: { enabled: true, actionThreshold: 8, windowMinutes: 10, alertOnKickBan: true, alertOnRoleChanges: true, alertOnChannelChanges: true }
        });

        const securitySystem = this.client?.modules?.get?.("security") ?? security;
        const securityConfig = securitySystem?.service?.config?.get?.(guildId);
        if (securityConfig) {
            for (const key of ["antiRaid", "antiSpam", "antiBot", "antiNuke"]) {
                if (securityConfig[key]) securityConfig[key].enabled = true;
            }
            if (securityConfig.logging) securityConfig.logging.enabled = true;
            securitySystem.service.config.update(guildId, securityConfig);
        }

        const moderationConfig = moderation.manager.getConfig(guildId);
        moderation.manager.setConfig(guildId, { ...moderationConfig, enabled: true });
        return config;
    }

    async toggleProtection(guildId, key) {
        const config = await this.get(guildId);
        if (!(key in config.security)) return config;
        const enabled = !config.security[key];
        await setupConfig.set(guildId, { security: { [key]: enabled } });
        const securitySystem = this.client?.modules?.get?.("security") ?? security;
        const securityConfig = securitySystem?.service?.config?.get?.(guildId);
        if (securityConfig && key !== "logging" && securityConfig[key]) {
            securityConfig[key].enabled = enabled;
            securitySystem.service.config.update(guildId, securityConfig);
        } else if (securityConfig && key === "logging" && securityConfig.logging) {
            securityConfig.logging.enabled = enabled;
            securitySystem.service.config.update(guildId, securityConfig);
        }
        return setupConfig.get(guildId);
    }

    async setModeration(guildId, changes) {
        const config = await setupConfig.set(guildId, { moderation: changes });
        const moderationConfig = moderation.manager.getConfig(guildId);
        moderation.manager.setConfig(guildId, { ...moderationConfig, ...changes });
        return config;
    }

    async addCoOwner(guildId, userId) {
        const config = await this.get(guildId);
        if (!config.coOwners.includes(userId)) config.coOwners.push(userId);
        if (!config.alertContacts.includes(userId)) config.alertContacts.push(userId);
        return setupConfig.set(guildId, { coOwners: config.coOwners, alertContacts: config.alertContacts });
    }

    async removeCoOwner(guildId, userId) {
        const config = await this.get(guildId);
        config.coOwners = config.coOwners.filter(id => id !== userId);
        config.alertContacts = config.alertContacts.filter(id => id !== userId);
        return setupConfig.set(guildId, { coOwners: config.coOwners, alertContacts: config.alertContacts });
    }

    async setMonitoring(guildId, changes) {
        return setupConfig.set(guildId, { monitoring: changes });
    }

    async recordModeratorAction(guild, userId, action) {
        if (!guild || !userId) return { alerted: false, count: 0 };
        const config = await this.get(guild.id);
        if (!config.monitoring.enabled) return { alerted: false, count: 0 };
        const now = Date.now();
        const windowMs = Math.max(1, Number(config.monitoring.windowMinutes) || 10) * 60_000;
        const key = `${guild.id}:${userId}`;
        const entries = (this.activity.get(key) ?? []).filter(entry => now - entry.at <= windowMs);
        entries.push({ at: now, action });
        this.activity.set(key, entries);
        const threshold = Math.max(1, Number(config.monitoring.actionThreshold) || 8);
        if (entries.length < threshold) return { alerted: false, count: entries.length };
        const alertKey = `${key}:alert`;
        const lastAlert = this.activity.get(alertKey)?.[0]?.at ?? 0;
        if (now - lastAlert < windowMs) return { alerted: false, count: entries.length };
        this.activity.set(alertKey, [{ at: now }]);
        const incident = { guild, moderator: { id: userId, user: { tag: `<@${userId}>` } }, action, severity: entries.length >= threshold * 2 ? "HIGH" : "MEDIUM", score: entries.length, count: entries.length };
        const contacts = new Set([guild.ownerId, ...(config.coOwners ?? [])]);
        const message = `🚨 **Nocthera Moderator Activity Alert**\n<@${userId}> performed **${entries.length} moderation actions** within ${config.monitoring.windowMinutes} minutes in **${guild.name}**.\nLatest action: **${action}**.`;
        for (const contactId of contacts) {
            try {
                const user = await guild.client.users.fetch(contactId);
                await user.send({ content: message });
            } catch { /* DMs can be disabled. */ }
        }
        if (config.logChannelId) {
            try {
                const channel = await guild.channels.fetch(config.logChannelId);
                if (channel?.isTextBased()) await channel.send({ content: message });
            } catch { /* Channel may be unavailable. */ }
        }
        logger.security(`Moderator activity alert: ${guild.name} / ${userId} / ${entries.length} actions.`);
        return { alerted: true, count: entries.length, incident };
    }


    async setJoinToCreate(guildId, changes) {
        const current = await this.get(guildId);
        const next = {
            enabled: changes.enabled ?? current.joinToCreate?.enabled ?? false,
            creatorChannelId: changes.creatorChannelId ?? current.joinToCreate?.creatorChannelId ?? null,
            categoryId: changes.categoryId ?? current.joinToCreate?.categoryId ?? null,
            createdChannels: changes.createdChannels ?? current.joinToCreate?.createdChannels ?? {}
        };
        return setupConfig.set(guildId, { joinToCreate: next });
    }

    async disableJoinToCreate(guildId) {
        const current = await this.get(guildId);
        const tracked = Object.keys(current.joinToCreate?.createdChannels ?? {});
        const guild = this.client?.guilds?.cache?.get(guildId);
        if (guild) {
            for (const channelId of tracked) {
                const channel = await guild.channels.fetch(channelId).catch(() => null);
                if (channel) await channel.delete("Nocthera Join-to-Create disabled").catch(() => {});
            }
        }
        return this.setJoinToCreate(guildId, { enabled: false, createdChannels: {} });
    }

    async registerCreatedVoice(guildId, channelId, ownerId) {
        const current = await this.get(guildId);
        const createdChannels = { ...(current.joinToCreate?.createdChannels ?? {}) };
        createdChannels[channelId] = ownerId;
        return this.setJoinToCreate(guildId, { createdChannels });
    }

    async unregisterCreatedVoice(guildId, channelId) {
        const current = await this.get(guildId);
        const createdChannels = { ...(current.joinToCreate?.createdChannels ?? {}) };
        delete createdChannels[channelId];
        return this.setJoinToCreate(guildId, { createdChannels });
    }

    async reset(guildId) {
        for (const key of this.activity.keys()) if (key.startsWith(`${guildId}:`)) this.activity.delete(key);
        return setupConfig.reset(guildId);
    }
}

export default new SetupSystem();
