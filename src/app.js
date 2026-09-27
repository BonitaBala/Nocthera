/**
 * ============================================================
 * Nocthera v1.1.0
 * Main Application
 * ============================================================
 */

import "dotenv/config";

import architecture from "../architecture.js";
import validator from "./core/architectureValidator.js";

import createClient from "./client.js";

import logger from "./core/logger.js";
import config from "./core/config.js";
import database from "./core/database.js";

import moduleManager from "./core/moduleManager.js";

import commands from "./commands/index.js";
import events from "./events/index.js";

import deployCommands from "./events/ready/deployCommands.js";

import { fileURLToPath } from "node:url";

let client = null;

// ============================================================
// Bootstrap
// ============================================================

async function bootstrap() {

    const startedAt = Date.now();

    console.clear();

    console.log("==================================================");
    console.log(
        `🌙 ${architecture.project.name} v${architecture.project.version}`
    );
    console.log(
        `Codename: ${architecture.project.codename}`
    );
    console.log("==================================================\n");

    // ========================================================
    // Architecture Validation
    // ========================================================

    if (!validator.run()) {

        console.error("\n❌ Startup aborted.");

        process.exit(1);

    }

    // ========================================================
    // Logger
    // ========================================================

    logger.start();

    // ========================================================
    // Configuration
    // ========================================================

    logger.info("Loading configuration...");

    await config.load();

    const discordToken = config.getValue("discord", "token") || "";
    logger.info(
        `Discord token loaded (${discordToken.length} characters; normalized prefix/whitespace).`
    );

    // ========================================================
    // Database
    // ========================================================

    logger.info("Connecting database...");

    await database.connect();

    // ========================================================
    // Discord Client
    // ========================================================

    logger.info("Creating Discord client...");

    client = createClient();

    // ========================================================
    // Modules
    // ========================================================

    logger.info("Loading modules...");

    await moduleManager.initialize(client);

    // ========================================================
    // Command System
    // ========================================================

    logger.info("Initializing command system...");

    await commands.initialize(client);

    const commandDirectory = fileURLToPath(
        new URL("./commands/", import.meta.url)
    );

    const commandResult =
        await commands.load(
            commandDirectory
        );

    logger.info(
        `${commandResult.loaded.length} command file(s) processed.`
    );

    if (commandResult.failed.length > 0) {

        logger.warn(
            `${commandResult.failed.length} command file(s) failed.`
        );

    }

    // ========================================================
    // Application Commands
    // ========================================================

    client.applicationCommands =
        commands.registry.toJSON();

    // ========================================================
    // Event System
    // ========================================================

    logger.info("Initializing event system...");

    await events.initialize(client);

    const eventDirectory = fileURLToPath(
        new URL("./events/", import.meta.url)
    );

    const eventResult =
        await events.load(
            eventDirectory
        );

    logger.info(
        `${eventResult.loaded.length} event file(s) processed.`
    );

    if (eventResult.failed.length > 0) {

        logger.warn(
            `${eventResult.failed.length} event file(s) failed.`
        );

    }

    // ========================================================
    // Slash Command Deployment
    // ========================================================

    logger.info(
        "Deploying application commands..."
    );

    await deployCommands(client);

    // ========================================================
    // Login
    // ========================================================

    logger.info(
        "Logging into Discord..."
    );

    await client.login(
        config.getValue("discord", "token")
    );

    const elapsed =
        Date.now() - startedAt;

    logger.success(
        `Nocthera started successfully in ${elapsed} ms.`
    );

}

// ============================================================
// Graceful Shutdown
// ============================================================

async function shutdown(signal) {

    logger.warn(
        `Received ${signal}. Shutting down...`
    );

    try {

        await commands.shutdown();

    } catch (error) {

        logger.error(error);

    }

    try {

        await events.shutdown();

    } catch (error) {

        logger.error(error);

    }

    try {

        await moduleManager.shutdown();

    } catch (error) {

        logger.error(error);

    }

    try {

        await database.disconnect?.();

    } catch (error) {

        logger.error(error);

    }

    try {

        client?.destroy();

    } catch (error) {

        logger.error(error);

    }

    logger.success(
        "Shutdown complete."
    );

    process.exit(0);

}

// ============================================================
// Process Signals
// ============================================================

process.once(
    "SIGINT",
    () => shutdown("SIGINT")
);

process.once(
    "SIGTERM",
    () => shutdown("SIGTERM")
);

// ============================================================
// Error Handling
// ============================================================

process.on(
    "unhandledRejection",
    error => {

        logger.fatal(error);

    }
);

process.on(
    "uncaughtException",
    error => {

        logger.fatal(error);

        process.exit(1);

    }
);

// ============================================================
// Start
// ============================================================

bootstrap().catch(error => {

    logger.fatal(error);

    process.exit(1);

});