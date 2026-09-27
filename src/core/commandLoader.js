/**
 * ============================================================
 * Nocthera v1.1.0
 * Legacy Command Loader Bridge
 * ============================================================
 *
 * The actual command loading is now handled by:
 *
 *     src/commands/
 *
 * This file remains as a compatibility bridge for older
 * parts of Nocthera that may still import core/commandLoader.js.
 * ============================================================
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import logger from "./logger.js";
import commands from "../commands/index.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const COMMANDS_DIRECTORY = path.resolve(
    __dirname,
    "../commands"
);

export default async function loadCommands(client) {

    try {

        if (!client) {

            throw new Error(
                "Discord client is required."
            );

        }

        logger.info(
            "Loading commands through the command system..."
        );

        // =====================================================
        // Initialize
        // =====================================================

        await commands.initialize(

            client

        );

        // =====================================================
        // Load
        // =====================================================

        const result =
            await commands.load(

                COMMANDS_DIRECTORY

            );

        // =====================================================
        // Update Runtime Statistics
        // =====================================================

        client.stats.commandsLoaded =
            client.commands.size;

        client.applicationCommands =
            commands.registry.toJSON();

        // =====================================================
        // Report
        // =====================================================

        logger.info(

            `${result.loaded.length} command(s) loaded.`

        );

        if (result.failed.length > 0) {

            logger.warn(

                `${result.failed.length} command(s) failed.`

            );

        }

        return result;

    } catch (error) {

        logger.fatal(

            error?.stack ??
            error

        );

        throw error;

    }

}