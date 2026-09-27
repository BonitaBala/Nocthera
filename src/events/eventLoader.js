/**
 * ============================================================
 * Nocthera v1.1.0
 * Event Loader
 * ============================================================
 */

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import eventManager from "./eventManager.js";
import eventRegistry from "./eventRegistry.js";

class EventLoader {

    constructor() {

        this.client = null;

        this.loaded = [];

        this.failed = [];

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        if (!client) {

            throw new Error(
                "Discord client is required."
            );

        }

        this.client = client;

        if (!this.client.events) {

            this.client.events = new Map();

        }

        return true;

    }

    // ========================================================
    // Load Events
    // ========================================================

    async load(directory) {

        if (!this.client) {

            throw new Error(
                "Event loader has not been initialized."
            );

        }

        this.loaded = [];

        this.failed = [];

        const files = await this.getFiles(

            directory

        );

        for (const file of files) {

            await this.loadFile(file);

        }

        this.client.stats.eventsLoaded =
            this.loaded.length;

        eventRegistry.sync();

        return {

            loaded: this.loaded,

            failed: this.failed

        };

    }

    // ========================================================
    // Recursive File Discovery
    // ========================================================

    async getFiles(directory) {

        const entries = await fs.readdir(

            directory,

            {

                withFileTypes: true

            }

        );

        const files = [];

        for (const entry of entries) {

            const fullPath = path.join(

                directory,

                entry.name

            );

            if (entry.isDirectory()) {

                files.push(

                    ...(await this.getFiles(

                        fullPath

                    ))

                );

                continue;

            }

            if (!entry.isFile()) {

                continue;

            }

            if (!entry.name.endsWith(".js")) {

                continue;

            }

            // ------------------------------------------------
            // Skip system/helper files
            // ------------------------------------------------

            const ignoredFiles = new Set([

                "eventConfig.js",
                "eventService.js",
                "eventManager.js",
                "eventLoader.js",
                "eventHandler.js",
                "eventRegistry.js",
                "index.js"

            ]);

            if (
                ignoredFiles.has(
                    entry.name
                )
            ) {

                continue;

            }

            // ------------------------------------------------
            // Skip private files
            // ------------------------------------------------

            if (
                entry.name.startsWith("_")
            ) {

                continue;

            }

            files.push(fullPath);

        }

        return files;

    }

    // ========================================================
    // Load Individual Event
    // ========================================================

    async loadFile(file) {

        try {

            const module =
                await import(

                    `${pathToFileURL(file).href}?t=${Date.now()}`

                );

            const event = module.default;

            if (!event) {

                return;

            }

            if (
                !event.name ||
                typeof event.execute !==
                "function"
            ) {

                return;

            }

            // ------------------------------------------------
            // Ignore Disabled Events
            // ------------------------------------------------

            if (
                eventManager.isIgnored(
                    event.name
                )
            ) {

                return;

            }

            // ------------------------------------------------
            // Duplicate Protection
            // ------------------------------------------------

            if (
                this.client.events.has(
                    event.name
                )
            ) {

                this.failed.push({

                    name: event.name,

                    file,

                    error:
                        `Duplicate event detected: ${event.name}`

                });

                return;

            }

            // ------------------------------------------------
            // Handler
            // ------------------------------------------------

            const handler = async (...args) => {

                eventManager.recordExecution(

                    event.name

                );

                try {

                    await event.execute(

                        this.client,

                        ...args

                    );

                } catch (error) {

                    eventManager.recordError(

                        event.name,

                        error

                    );

                    throw error;

                }

            };

            // ------------------------------------------------
            // Discord Registration
            // ------------------------------------------------

            if (event.once) {

                this.client.once(

                    event.name,

                    handler

                );

            } else {

                this.client.on(

                    event.name,

                    handler

                );

            }

            // ------------------------------------------------
            // Runtime Registry
            // ------------------------------------------------

            this.client.events.set(

                event.name,

                event

            );

            eventManager.register(

                event.name,

                file,

                Boolean(event.once)

            );

            eventRegistry.register(

                event

            );

            // ------------------------------------------------
            // Result
            // ------------------------------------------------

            this.loaded.push({

                name: event.name,

                file,

                once: Boolean(event.once)

            });

        } catch (error) {

            this.failed.push({

                file,

                error:
                    error?.message ??
                    String(error)

            });

        }

    }

    // ========================================================
    // Loaded Events
    // ========================================================

    getLoaded() {

        return [

            ...this.loaded

        ];

    }

    // ========================================================
    // Failed Events
    // ========================================================

    getFailed() {

        return [

            ...this.failed

        ];

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        this.loaded = [];

        this.failed = [];

        if (this.client?.events) {

            this.client.events.clear();

        }

        this.client = null;

    }

}

export default new EventLoader();