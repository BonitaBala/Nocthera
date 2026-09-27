/**
 * ============================================================
 * Nocthera v1.1.0
 * Logging Service
 * ============================================================
 */

import {
    EmbedBuilder
} from "discord.js";

import loggingConfig from "./loggingConfig.js";
import setupConfig from "../setupConfig.js";

class LoggingService {

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

                loggingConfig.create()

            );

        }

        return this.guilds.get(guildId);

    }

    set(guildId, config) {

        const merged = loggingConfig.merge(config);

        this.guilds.set(

            guildId,

            merged

        );

        return merged;

    }

    /**
     * ========================================================
     * Send Log
     * ========================================================
     */

    async send(guild, type, options = {}) {

        const config = this.get(guild.id);

        if (!config.enabled) {
            return false;
        }

        let channelId = config.channels[type];

        // The guided setup stores one general-purpose alert/log channel.
        // Use it as a reliable fallback when a per-category logging channel
        // has not been configured in the current runtime.
        if (!channelId) {
            const setup = await setupConfig.get(guild.id).catch(() => null);
            channelId = setup?.logChannelId ?? null;
        }

        if (!channelId) return false;

        const channel = await guild.channels.fetch(channelId).catch(() => null);
        if (!channel?.isTextBased?.()) return false;

        const embed = new EmbedBuilder()

            .setColor(options.color ?? "#5865F2")

            .setTitle(options.title ?? "Log")

            .setDescription(options.description ?? "No details provided.")

            .setTimestamp();

        if (options.fields?.length) {

            embed.addFields(options.fields);

        }

        if (options.footer) {

            embed.setFooter({

                text: options.footer

            });

        }

        await channel.send({

            embeds: [embed]

        });

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

export default new LoggingService();