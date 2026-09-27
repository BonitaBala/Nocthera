/**
 * ============================================================
 * Nocthera v1.1.0
 * Embed Service
 * ============================================================
 */

import {
    EmbedBuilder
} from "discord.js";

import embedConfig from "./embedConfig.js";

class EmbedService {

    constructor() {

        this.client = null;

        this.guilds = new Map();

        this.templates = new Map();

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        this.client = client;

    }

    async start() {

        return true;

    }

    // ========================================================
    // Configuration
    // ========================================================

    getConfig(guildId) {

        if (!this.guilds.has(guildId)) {

            this.guilds.set(

                guildId,

                embedConfig.create()

            );

        }

        return this.guilds.get(guildId);

    }

    setConfig(guildId, config) {

        const merged = embedConfig.merge(config);

        this.guilds.set(

            guildId,

            merged

        );

        return merged;

    }

    // ========================================================
    // Create Embed
    // ========================================================

    create(data = {}) {

        const embed = new EmbedBuilder();

        if (data.title) {

            embed.setTitle(

                String(data.title).slice(0, 256)

            );

        }

        if (data.description) {

            embed.setDescription(

                String(data.description).slice(0, 4096)

            );

        }

        if (data.url) {

            embed.setURL(data.url);

        }

        if (data.color !== undefined) {

            embed.setColor(data.color);

        }

        if (data.timestamp) {

            embed.setTimestamp(

                data.timestamp === true

                    ? new Date()

                    : new Date(data.timestamp)

            );

        }

        if (data.thumbnail?.url) {

            embed.setThumbnail(

                data.thumbnail.url

            );

        }

        if (data.image?.url) {

            embed.setImage(

                data.image.url

            );

        }

        if (data.author) {

            embed.setAuthor({

                name: String(

                    data.author.name ?? "Nocthera"

                ).slice(0, 256),

                ...(data.author.iconURL && {

                    iconURL: data.author.iconURL

                }),

                ...(data.author.url && {

                    url: data.author.url

                })

            });

        }

        if (data.footer) {

            embed.setFooter({

                text: String(

                    data.footer.text ?? ""

                ).slice(0, 2048),

                ...(data.footer.iconURL && {

                    iconURL: data.footer.iconURL

                })

            });

        }

        if (Array.isArray(data.fields)) {

            const fields = data.fields

                .filter(field => field?.name && field?.value)

                .slice(0, 25)

                .map(field => ({

                    name: String(field.name).slice(0, 256),

                    value: String(field.value).slice(0, 1024),

                    inline: Boolean(field.inline)

                }));

            if (fields.length) {

                embed.addFields(fields);

            }

        }

        return embed;

    }

    // ========================================================
    // Validate
    // ========================================================

    validate(data = {}) {

        const config = embedConfig.create();

        if (

            data.title &&

            String(data.title).length >

            config.maxTitle

        ) {

            return false;

        }

        if (

            data.description &&

            String(data.description).length >

            config.maxDescription

        ) {

            return false;

        }

        if (

            Array.isArray(data.fields) &&

            data.fields.length >

            config.maxFields

        ) {

            return false;

        }

        return true;

    }

    // ========================================================
    // Templates
    // ========================================================

    saveTemplate(guildId, name, data) {

        if (!guildId || !name) {

            return false;

        }

        if (!this.templates.has(guildId)) {

            this.templates.set(

                guildId,

                new Map()

            );

        }

        this.templates

            .get(guildId)

            .set(

                name,

                structuredClone(data)

            );

        return true;

    }

    getTemplate(guildId, name) {

        return this.templates

            .get(guildId)

            ?.get(name) ?? null;

    }

    deleteTemplate(guildId, name) {

        return this.templates

            .get(guildId)

            ?.delete(name) ?? false;

    }

    listTemplates(guildId) {

        return [

            ...(this.templates

                .get(guildId)

                ?.keys() ?? [])

        ];

    }

    // ========================================================
    // Export / Import
    // ========================================================

    export(data) {

        return JSON.stringify(

            data,

            null,

            4

        );

    }

    import(data) {

        if (typeof data !== "string") {

            return null;

        }

        try {

            return JSON.parse(data);

        } catch {

            return null;

        }

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        this.guilds.clear();

        this.templates.clear();

        this.client = null;

    }

}

export default new EmbedService();