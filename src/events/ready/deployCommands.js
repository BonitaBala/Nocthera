/**
 * ============================================================
 * Nocthera v1.1.0
 * Slash Command Deployment
 * ============================================================
 */

import { Routes } from "discord.js";

import logger from "../../core/logger.js";
import config from "../../core/config.js";

export default async function deployCommands(client) {

    const applicationId = config.getValue(
        "discord",
        "applicationId"
    );

    if (!applicationId) {

        throw new Error(
            "Discord applicationId is missing from configuration."
        );

    }

    try {

        logger.info(
            "Deploying slash commands..."
        );

        const commands =
            client.applicationCommands ?? [];

        await client.rest.put(

            Routes.applicationCommands(
                applicationId
            ),

            {

                body: commands

            }

        );

        logger.success(

            `${commands.length} slash command(s) deployed.`

        );

    } catch (error) {

        logger.fatal(

            error?.stack ??
            error

        );

        throw error;

    }

}