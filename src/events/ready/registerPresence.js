/**
 * ============================================================
 * Nocthera v1.1.0
 * Startup Presence Service
 * ============================================================
 */

import {
    ActivityType
} from "discord.js";

import logger from "../../core/logger.js";

export default async function registerPresence(client) {

    try {

        await client.user.setPresence({

            status: "online",

            activities: [

                {

                    name: "/help • Nocthera v1.1.0",

                    type: ActivityType.Watching

                }

            ]

        });

        logger.success("Presence initialized.");

    } catch (error) {

        logger.error(error.stack);

    }

}