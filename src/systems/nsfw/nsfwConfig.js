/**
 * ============================================================
 * Nocthera v1.1.0
 * NSFW System Configuration
 * ============================================================
 */

import database from "../../core/database.js";

const DEFAULTS = {
    enabled: false,
    enabledAt: null,
    enabledBy: null,
    cooldownSeconds: 0,
    maxPerHour: 0,
    categories: {
        real: true,
        hentai: true,
        "3d": true
    }
};

function clone(value) {
    return structuredClone(value);
}

function merge(base, value) {
    const result = clone(base);
    if (!value || typeof value !== "object") return result;
    for (const [key, val] of Object.entries(value)) {
        if (
            val &&
            typeof val === "object" &&
            !Array.isArray(val) &&
            result[key] &&
            typeof result[key] === "object"
        ) {
            result[key] = { ...result[key], ...val };
        } else {
            result[key] = val;
        }
    }
    return result;
}

class NsfwConfig {
    constructor() {
        this.cache = new Map();
        this.ready = false;
    }

    async ensureTable() {
        if (this.ready) return;
        await database.query(`
            CREATE TABLE IF NOT EXISTS nocthera_nsfw_guilds (
                guild_id TEXT PRIMARY KEY,
                config JSONB NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
        this.ready = true;
    }

    async get(guildId) {
        await this.ensureTable();
        if (this.cache.has(guildId)) return this.cache.get(guildId);
        const result = await database.query(
            "SELECT config FROM nocthera_nsfw_guilds WHERE guild_id = $1",
            [guildId]
        );
        const config = merge(DEFAULTS, result.rows[0]?.config);
        // ensure categories object always present
        if (!config.categories) config.categories = { ...DEFAULTS.categories };
        this.cache.set(guildId, config);
        return config;
    }

    async set(guildId, changes) {
        await this.ensureTable();
        const current = await this.get(guildId);
        const next = merge(current, changes);
        next.updatedAt = new Date().toISOString();
        await database.query(
            `INSERT INTO nocthera_nsfw_guilds (guild_id, config, updated_at)
             VALUES ($1, $2::jsonb, NOW())
             ON CONFLICT (guild_id) DO UPDATE
             SET config = EXCLUDED.config, updated_at = NOW()`,
            [guildId, JSON.stringify(next)]
        );
        this.cache.set(guildId, next);
        return next;
    }

    async enable(guildId, userId) {
        return this.set(guildId, {
            enabled: true,
            enabledAt: new Date().toISOString(),
            enabledBy: userId
        });
    }

    async disable(guildId) {
        return this.set(guildId, {
            enabled: false
        });
    }

    async toggleCategory(guildId, category) {
        const cfg = await this.get(guildId);
        const cats = { ...(cfg.categories || DEFAULTS.categories) };
        if (!(category in cats)) return cfg;
        cats[category] = !cats[category];
        return this.set(guildId, { categories: cats });
    }

    clearCache(guildId) {
        if (guildId) this.cache.delete(guildId);
        else this.cache.clear();
    }
}

const nsfwConfig = new NsfwConfig();

export default nsfwConfig;
