/**
 * ============================================================
 * Nocthera v1.1.0
 * Status Rotation Service
 * ============================================================
 */

import { ActivityType } from "discord.js";
import logger from "../../core/logger.js";

const INTERVAL = 300000; // 5 minutes

export default function registerStatusRotation(client) {

    logger.info("Status rotation started.");

    const statuses = [

        () => ({
            name: "/help • Nocthera",
            type: ActivityType.Watching
        }),

        () => ({
            name: `${client.guilds.cache.size} Servers Protected`,
            type: ActivityType.Watching
        }),

        () => ({
            name: `${client.users.cache.size} Users`,
            type: ActivityType.Watching
        }),

        () => ({
            name: "Security Monitoring",
            type: ActivityType.Competing
        }),

        () => ({
            name: "AI Assistant Ready",
            type: ActivityType.Playing
        }),

        () => ({
            name: "Moderator Watch Active",
            type: ActivityType.Watching
        }),

        () => ({
            name: `v${client.version} Nora`,
            type: ActivityType.Playing
        })

    ];

    let index = 0;

    async function rotate() {

        try {

            const activity = statuses[index]();

            await client.user.setPresence({

                status: "online",

                activities: [activity]

            });

            index++;

            if (index >= statuses.length) {

                index = 0;

            }

        } catch (error) {

            logger.error(error.stack);

        }

    }

    rotate();

    const timer = setInterval(rotate, INTERVAL);

    timer.unref();

}