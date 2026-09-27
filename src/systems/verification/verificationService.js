/**
 * Nocthera v1.1.0 - Verification Service
 */

import verificationConfig from "./verificationConfig.js";

class VerificationService {
    constructor() {
        this.client = null;
        this.guilds = new Map();
        this.captchaSessions = new Map();
    }

    async initialize(client) {
        this.client = client;
    }

    get(guildId) {
        if (!this.guilds.has(guildId)) this.guilds.set(guildId, verificationConfig.create());
        return this.guilds.get(guildId);
    }

    set(guildId, config) {
        const merged = verificationConfig.merge(config);
        if (!verificationConfig.validate(merged)) throw new Error("Invalid verification configuration.");
        this.guilds.set(guildId, merged);
        return merged;
    }

    enable(guildId) {
        const config = this.get(guildId);
        config.enabled = true;
        return config;
    }

    disable(guildId) {
        const config = this.get(guildId);
        config.enabled = false;
        return config;
    }

    isEnabled(guildId) {
        return this.get(guildId).enabled;
    }

    reset(guildId) {
        const config = verificationConfig.create();
        this.guilds.set(guildId, config);
        return config;
    }

    async verify(member, options = {}) {
        if (!member?.guild) return { success: false, reason: "Invalid member." };
        const config = this.get(member.guild.id);
        if (!config.enabled) return { success: false, reason: "Verification is disabled." };

        if (config.protections.bypassRoles?.some(id => member.roles.cache.has(id))) {
            return this.applyVerifiedRole(member, config);
        }


        if (config.protections.accountAge) {
            const createdAt = member.user?.createdTimestamp ?? member.user?.createdAt?.getTime?.() ?? 0;
            const ageDays = Math.floor((Date.now() - createdAt) / 86400000);
            if (ageDays < Number(config.protections.minimumAccountAge)) {
                return {
                    success: false,
                    reason: `Your Discord account must be at least ${config.protections.minimumAccountAge} day(s) old.`,
                    accountAgeDays: ageDays
                };
            }
        }

        if (config.protections.joinGracePeriod && config.protections.joinGraceMinutes > 0 && member.joinedTimestamp) {
            const minutes = (Date.now() - member.joinedTimestamp) / 60000;
            if (minutes < Number(config.protections.joinGraceMinutes)) {
                return {
                    success: false,
                    reason: `Please wait ${Math.ceil(Number(config.protections.joinGraceMinutes) - minutes)} more minute(s) before verifying.`
                };
            }
        }

        if (config.protections.captcha && options.captchaPassed !== true) {
            const session = this.captchaSessions.get(`${member.guild.id}:${member.id}`);
            if (!session || session.expiresAt < Date.now()) {
                return { success: false, reason: "captcha_required" };
            }
        }

        return this.applyVerifiedRole(member, config);
    }

    async applyVerifiedRole(member, config) {
        try {
            if (config.protections.removeUnverifiedRole && config.unverifiedRole) {
                const role = member.guild.roles.cache.get(config.unverifiedRole);
                if (role && member.roles.cache.has(role.id)) await member.roles.remove(role);
            }
            if (config.verifiedRole) {
                const role = member.guild.roles.cache.get(config.verifiedRole);
                if (!role) return { success: false, reason: "The configured verified role no longer exists." };
                if (!member.roles.cache.has(role.id)) await member.roles.add(role);
            }
            return { success: true };
        } catch (error) {
            return { success: false, reason: error?.message ?? "Unable to update member roles." };
        }
    }

    createCaptcha(guildId, userId) {
        const config = this.get(guildId);
        const length = Number(config.protections.captchaLength) || 6;
        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < length; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
        this.captchaSessions.set(`${guildId}:${userId}`, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
        return code;
    }

    consumeCaptcha(guildId, userId, input) {
        const key = `${guildId}:${userId}`;
        const session = this.captchaSessions.get(key);
        if (!session || session.expiresAt < Date.now()) {
            this.captchaSessions.delete(key);
            return false;
        }
        const valid = String(input ?? "").trim().toUpperCase() === session.code;
        if (valid) this.captchaSessions.delete(key);
        return valid;
    }

    async shutdown() {
        this.guilds.clear();
        this.captchaSessions.clear();
        this.client = null;
    }
}

export default new VerificationService();
