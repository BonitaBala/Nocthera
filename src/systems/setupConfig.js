import database from "../core/database.js";

const DEFAULTS = {
    enabled: true,
    quickSecureApplied: false,
    security: {
        antiRaid: true,
        antiSpam: true,
        antiBot: true,
        antiNuke: true,
        logging: true
    },
    moderation: {
        enabled: true,
        warnLimit: 3,
        timeoutLimit: 5
    },
    monitoring: {
        enabled: true,
        actionThreshold: 8,
        windowMinutes: 10,
        alertOnKickBan: true,
        alertOnRoleChanges: true,
        alertOnChannelChanges: true
    },
    coOwners: [],
    alertContacts: [],
    logChannelId: null,
    joinToCreate: {
        enabled: false,
        creatorChannelId: null,
        categoryId: null,
        createdChannels: {}
    },
    configuredAt: null,
    updatedAt: null
};

function clone(value) {
    return structuredClone(value);
}

function merge(base, value) {
    const result = clone(base);
    if (!value || typeof value !== "object") return result;
    for (const [key, val] of Object.entries(value)) {
        if (val && typeof val === "object" && !Array.isArray(val) && result[key] && typeof result[key] === "object") {
            result[key] = { ...result[key], ...val };
        } else {
            result[key] = val;
        }
    }
    return result;
}

class SetupConfig {
    constructor() {
        this.cache = new Map();
        this.ready = false;
    }

    async ensureTable() {
        if (this.ready) return;
        await database.query(`
            CREATE TABLE IF NOT EXISTS nocthera_setup_guilds (
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
            "SELECT config FROM nocthera_setup_guilds WHERE guild_id = $1",
            [guildId]
        );
        const config = merge(DEFAULTS, result.rows[0]?.config);
        this.cache.set(guildId, config);
        return config;
    }

    async set(guildId, changes) {
        const current = await this.get(guildId);
        const next = merge(current, changes);
        next.updatedAt = new Date().toISOString();
        if (!next.configuredAt) next.configuredAt = next.updatedAt;
        this.cache.set(guildId, next);
        await database.query(
            `INSERT INTO nocthera_setup_guilds (guild_id, config, updated_at)
             VALUES ($1, $2::jsonb, NOW())
             ON CONFLICT (guild_id) DO UPDATE SET config = EXCLUDED.config, updated_at = NOW()`,
            [guildId, JSON.stringify(next)]
        );
        return next;
    }

    async reset(guildId) {
        this.cache.delete(guildId);
        const next = clone(DEFAULTS);
        next.updatedAt = new Date().toISOString();
        await database.query(
            `INSERT INTO nocthera_setup_guilds (guild_id, config, updated_at)
             VALUES ($1, $2::jsonb, NOW())
             ON CONFLICT (guild_id) DO UPDATE SET config = EXCLUDED.config, updated_at = NOW()`,
            [guildId, JSON.stringify(next)]
        );
        this.cache.set(guildId, next);
        return next;
    }

    defaults() {
        return clone(DEFAULTS);
    }
}

export { DEFAULTS };
export default new SetupConfig();
