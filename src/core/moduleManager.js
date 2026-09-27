/**
 * ============================================================
 * Nocthera v1.1.0
 * Core Module Manager
 * ============================================================
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import logger from "./logger.js";

const MODULE_DIRECTORY = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../systems"
);

const DISABLED_MODULES = new Set([
    "ai"
]);

class ModuleManager {

    constructor() {
        this.client = null;
        this.modules = new Map();
        this.failed = new Map();
    }

    async initialize(client) {
        if (!client) {
            throw new Error("Discord client is required.");
        }

        this.client = client;

        if (!this.client.modules) {
            this.client.modules = new Map();
        }

        await this.loadAll();
        return true;
    }

    async loadAll() {
        const folders = await fs.readdir(MODULE_DIRECTORY, {
            withFileTypes: true
        });

        for (const folder of folders) {
            if (!folder.isDirectory()) continue;

            const name = folder.name;
            const key = name.toLowerCase();

            if (DISABLED_MODULES.has(key)) {
                logger.info(`Module disabled: ${name}`);
                continue;
            }

            const indexFile = path.join(
                MODULE_DIRECTORY,
                name,
                "index.js"
            );

            try {
                await fs.access(indexFile);

                // Keep a stable ESM module URL so the module manager and
                // other imports (handlers/commands) share the same singleton
                // instance. Cache-busting here creates a second module
                // instance, which breaks stateful systems such as Security.
                const imported = await import(
                    pathToFileURL(indexFile).href
                );

                const system = imported.default;

                if (!system) {
                    throw new Error("Module has no default export.");
                }

                if (typeof system.initialize !== "function") {
                    throw new Error("Module is missing initialize().");
                }

                await system.initialize(this.client);

                if (typeof system.start === "function") {
                    await system.start(this.client);
                }

                this.modules.set(name, system);
                this.client.modules.set(name, system);

                logger.success(`Loaded module: ${name}`);
            } catch (error) {
                this.failed.set(name, error);
                logger.warn(`Failed to load module: ${name}`);
                logger.error(error?.stack ?? error);
            }
        }

        this.client.stats.modulesLoaded = this.modules.size;
        return this.list();
    }

    async shutdown() {
        for (const [name, module] of this.modules) {
            try {
                if (typeof module.shutdown === "function") {
                    await module.shutdown();
                }
            } catch (error) {
                logger.error(`Failed to shut down module ${name}.`);
                logger.error(error?.stack ?? error);
            }
        }

        this.modules.clear();
        this.failed.clear();

        this.client?.modules?.clear();
        this.client = null;
    }

    async reload() {
        if (!this.client) {
            throw new Error("Module manager is not initialized.");
        }

        const client = this.client;
        await this.shutdown();
        return this.initialize(client);
    }

    get(name) {
        return this.modules.get(name) ?? null;
    }

    has(name) {
        return this.modules.has(name);
    }

    async unload(name) {
        const module = this.modules.get(name);

        if (module && typeof module.shutdown === "function") {
            await module.shutdown();
        }

        this.modules.delete(name);
        this.client?.modules?.delete(name);
        return true;
    }

    list() {
        return [...this.modules.keys()];
    }

    count() {
        return this.modules.size;
    }

    getFailures() {
        return new Map(this.failed);
    }
}

export default new ModuleManager();
