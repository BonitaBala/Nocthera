/**
 * ============================================================
 * Nocthera v1.1.0
 * NSFW Manager
 * ============================================================
 */

import nsfwConfig from "./nsfwConfig.js";
import nsfwService, {
    isValidTag,
    normalizeTag,
    listTags,
    parsePrefixCommand
} from "./nsfwService.js";
import logger from "../../core/logger.js";

class NsfwManager {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    async initialize(client) {
        this.client = client;
        this.initialized = true;
        logger.info("NSFW manager ready");
        return true;
    }

    async isEnabled(guildId) {
        const cfg = await nsfwConfig.get(guildId);
        return Boolean(cfg.enabled);
    }

    async enable(guildId, userId) {
        return nsfwConfig.enable(guildId, userId);
    }

    async disable(guildId) {
        return nsfwConfig.disable(guildId);
    }

    async getConfig(guildId) {
        return nsfwConfig.get(guildId);
    }

    async toggleCategory(guildId, category) {
        return nsfwConfig.toggleCategory(guildId, category);
    }

    async cycleLimits(guildId) {
        const cfg = await nsfwConfig.get(guildId);
        const presets = [
            { cooldownSeconds: 0, maxPerHour: 0 },
            { cooldownSeconds: 5, maxPerHour: 20 },
            { cooldownSeconds: 8, maxPerHour: 30 },
            { cooldownSeconds: 15, maxPerHour: 50 }
        ];
        const curCd = cfg.cooldownSeconds ?? 0;
        const curMax = cfg.maxPerHour ?? 0;
        let idx = presets.findIndex(p => p.cooldownSeconds === curCd && p.maxPerHour === curMax);
        if (idx < 0) idx = 0;
        const next = presets[(idx + 1) % presets.length];
        return nsfwConfig.set(guildId, next);
    }

    isCategoryEnabled(cfg, mode) {
        const cats = cfg?.categories || {};
        if (mode === "3d") return cats["3d"] !== false;
        if (mode === "hentai") return cats.hentai !== false;
        return cats.real !== false;
    }

    getTags() { return listTags(); }
    isValidTag(tag) { return isValidTag(tag); }
    normalizeTag(tag) { return normalizeTag(tag); }
    parsePrefix(content) { return parsePrefixCommand(content); }

    async fetchForTag(tags, mode, guildId, userId, cfg) {
        if (!this.isCategoryEnabled(cfg, mode)) {
            const label = mode === "3d" ? "3D" : mode === "hentai" ? "Hentai" : "Real Life";
            return {
                error: `🚫 **${label}** category is disabled. An admin can enable it in \`/nsfw\`.`
            };
        }

        const remaining = nsfwService.checkCooldown(guildId, userId, cfg.cooldownSeconds ?? 0);
        if (remaining > 0) {
            return { error: `⏳ Cooldown: wait **${remaining}s**.` };
        }

        const hourWait = nsfwService.checkHourlyLimit(guildId, userId, cfg.maxPerHour ?? 0);
        if (hourWait > 0) {
            return {
                error: `🚫 Hourly limit reached. Try again in **${Math.ceil(hourWait / 60)} min**.`
            };
        }

        const image = await nsfwService.fetchImage(tags, mode, guildId);
        if (!image) {
            const tagStr = Array.isArray(tags) ? tags.join(" ") : tags;
            return { error: `❌ No results found for \`${tagStr}\` (${mode}). Try another tag.` };
        }

        return { image };
    }
}

const nsfwManager = new NsfwManager();
export default nsfwManager;
