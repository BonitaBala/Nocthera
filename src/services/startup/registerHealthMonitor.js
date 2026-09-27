/**
 * ============================================================
 * Nocthera v1.1.0
 * Health Monitor Service
 * ============================================================
 */

import logger from "../../core/logger.js";
import database from "../../core/database.js";

const MEMORY_WARNING_MB = 512;
const INTERVAL = 60000;

export default function registerHealthMonitor(client) {

    logger.info("Health monitor started.");

    const monitor = setInterval(async () => {

        try {

            const memory = process.memoryUsage();

            const heapUsedMB = Math.round(
                memory.heapUsed / 1024 / 1024
            );

            const db = await database.health();

            client.health = {

                timestamp: Date.now(),

                memory: {

                    heapUsedMB,

                    rssMB: Math.round(memory.rss / 1024 / 1024)

                },

                websocket: {

                    ping: client.ws.ping,

                    status: client.ws.status

                },

                database: db

            };

            if (heapUsedMB >= MEMORY_WARNING_MB) {

                logger.warn(
                    `High memory usage detected (${heapUsedMB} MB).`
                );

            }

            if (!db.connected) {

                logger.error(
                    "Database health check failed."
                );

            }

            if (client.ws.ping > 500) {

                logger.warn(
                    `High gateway ping (${client.ws.ping}ms).`
                );

            }

        } catch (error) {

            logger.error(error.stack);

        }

    }, INTERVAL);

    monitor.unref();

}