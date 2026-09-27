/**
 * ============================================================
 * Nocthera v1.1.0
 * Module Loader
 * ============================================================
 */

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import logger from "./logger.js";

const MODULE_DIRECTORY = path.resolve("src", "systems");

export default async function loadModules(client) {

    logger.info("Loading modules...");

    try {

        const files = await fs.readdir(MODULE_DIRECTORY);

        const modules = files.filter(file => file.endsWith(".js"));

        for (const file of modules) {

            const filePath = path.join(MODULE_DIRECTORY, file);

            const module = await import(pathToFileURL(filePath).href);

            const system = module.default;

            if (!system) {

                logger.warn(`${file} has no default export.`);

                continue;

            }

            if (typeof system.initialize !== "function") {

                logger.warn(`${file} does not export initialize().`);

                continue;

            }

            await system.initialize(client);

            client.modules.set(system.name, system);

            logger.success(`Loaded module: ${system.name}`);

        }

        client.stats.modulesLoaded = client.modules.size;

        logger.info(`${client.modules.size} module(s) loaded.`);

    } catch (error) {

        logger.fatal(error);

        throw error;

    }

}