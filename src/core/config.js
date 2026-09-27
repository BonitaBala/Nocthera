/**
 * ============================================================
 * Nocthera v1.1.0
 * Configuration Manager
 * ============================================================
 */

import logger from "./logger.js";

class ConfigManager {

    constructor() {

        this.loaded = false;

        this.cache = new Map();

    }

    async load() {

        this.cache.set("bot", {

            name: process.env.BOT_NAME || "Nocthera",

            version: process.env.BOT_VERSION || "1.1.0",

            prefix: process.env.PREFIX || "!",

            language: process.env.DEFAULT_LANGUAGE || "en"

        });

        this.cache.set("discord", {

            token: process.env.BOT_TOKEN,

            clientId: process.env.CLIENT_ID,

            applicationId: process.env.APPLICATION_ID,

            ownerId: process.env.OWNER_ID

        });

        this.cache.set("database", {

            url: process.env.DATABASE_URL,

            name: process.env.DATABASE_NAME || "nocthera",

            ssl: process.env.DATABASE_SSL === "true"

        });

        this.cache.set("security", {

            mode: process.env.SECURITY_MODE || "development"

        });

        this.cache.set("dashboard", {

            enabled: process.env.DASHBOARD_ENABLED === "true",

            port: Number(process.env.DASHBOARD_PORT) || 3000

        });

        this.validate();

        this.loaded = true;

        logger.success("Configuration initialized.");

    }

    validate() {

        const discord = this.get("discord");

        if (!discord.token)
            throw new Error("BOT_TOKEN is missing.");

        if (!discord.clientId)
            throw new Error("CLIENT_ID is missing.");

        if (!discord.applicationId)
            throw new Error("APPLICATION_ID is missing.");

        const database = this.get("database");

        if (!database?.url)
            throw new Error("DATABASE_URL is missing.");

    }

    get(section) {

        return this.cache.get(section);

    }

    getValue(section, key) {

        return this.cache.get(section)?.[key];

    }

    set(section, value) {

        this.cache.set(section, value);

    }

    has(section) {

        return this.cache.has(section);

    }

    isLoaded() {

        return this.loaded;

    }

}

export default new ConfigManager();