/**
 * ============================================================
 * Nocthera v1.1.0
 * Startup Statistics Service
 * ============================================================
 */

import logger from "../../core/logger.js";

export default async function registerStatistics(client) {

    try {

        const memory = process.memoryUsage();

        client.stats.bootCompleted = Date.now();

        client.stats.guildsProtected = client.guilds.cache.size;

        client.stats.users = client.guilds.cache.reduce(

            (total, guild) => total + guild.memberCount,

            0

        );

        client.stats.channels = client.channels.cache.size;

        client.stats.memory = {

            rss: memory.rss,

            heapTotal: memory.heapTotal,

            heapUsed: memory.heapUsed,

            external: memory.external

        };

        client.stats.node = process.version;

        client.stats.platform = process.platform;

        client.stats.pid = process.pid;

        logger.success("Startup statistics initialized.");

    } catch (error) {

        logger.error(error.stack);

    }

}