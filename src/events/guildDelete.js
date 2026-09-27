/**
 * ============================================================
 * Nocthera v1.1.0
 * Guild Delete Event
 * ============================================================
 */

import logger from "../core/logger.js";

export default {

    name: "guildDelete",

    once: false,

    async execute(client, guild) {

        logger.warn(`Removed from guild: ${guild.name} (${guild.id})`);

        try {

            // =====================================================
            // Remove Cached Data
            // =====================================================

            client.guildConfigs.delete(guild.id);

            client.settings.delete(guild.id);

            client.cacheManager.delete(guild.id);

            // =====================================================
            // Remove Active Data
            // =====================================================

            client.tickets.delete(guild.id);

            client.verifications.delete(guild.id);

            client.incidents.delete(guild.id);

            // =====================================================
            // Update Statistics
            // =====================================================

            client.stats.guildsProtected =
                client.guilds.cache.size;

            logger.info(
                `Cleaned cache for ${guild.name}.`
            );

        } catch (error) {

            logger.error(error.stack);

        }

    }

};