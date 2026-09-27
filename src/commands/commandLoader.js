/**
 * ============================================================
 * Nocthera v1.1.0
 * Command Loader
 * ============================================================
 */

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import permissions from "../core/permissions.js";

class CommandLoader {

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

        if (!this.client.commands) {

            this.client.commands = new Map();

        }

        if (!this.client.applicationCommands) {

            this.client.applicationCommands = [];

        }

        return true;

    }

    // ========================================================
    // Load Commands
    // ========================================================

    async load(directory) {

        if (!this.client) {

            throw new Error(
                "Command loader is not initialized."
            );

        }

        this.loaded = [];

        this.failed = [];

        const files =
            await this.getFiles(directory);

        for (const file of files) {

            await this.loadFile(file);

        }

        this.client.stats.commandsLoaded =
            this.client.commands.size;

        this.client.applicationCommands =
            this.getApplicationCommands();

        return {

            loaded: this.loaded,

            failed: this.failed

        };

    }

    // ========================================================
    // Recursive File Discovery
    // ========================================================

    async getFiles(directory) {

        const entries =
            await fs.readdir(

                directory,

                {

                    withFileTypes: true

                }

            );

        const files = [];

        for (const entry of entries) {

            const fullPath =
                path.join(

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

            if (
                entry.isFile() &&
                entry.name.endsWith(".js") &&
                !entry.name.startsWith("_")
            ) {

                files.push(fullPath);

            }

        }

        return files;

    }

    // ========================================================
    // Load Individual Command
    // ========================================================

    async loadFile(file) {

        try {

            if (!this.client) {

                throw new Error(
                    "Command loader is not initialized."
                );

            }

            const module =
                await import(

                    `${pathToFileURL(file).href}?t=${Date.now()}`

                );

            const command = module.default;

            // ------------------------------------------------
            // Ignore helper/system files
            // ------------------------------------------------

            if (!command) {

                return;

            }

            // ------------------------------------------------
            // Validate Command
            // ------------------------------------------------

            if (!command.data) {

                return;

            }

            if (
                typeof command.execute !==
                "function"
            ) {

                this.failed.push({

                    file,

                    error:
                        "Command is missing execute()."

                });

                return;

            }

            const data =
                command.data;

            if (
                typeof data.toJSON !==
                "function"
            ) {

                this.failed.push({

                    file,

                    error:
                        "Command data must provide toJSON()."

                });

                return;

            }

            const json =
                data.toJSON();

            const name =
                json.name;

            if (!name) {

                this.failed.push({

                    file,

                    error:
                        "Command is missing a name."

                });

                return;

            }

            // ------------------------------------------------
            // Duplicate Protection
            // ------------------------------------------------

            if (
                this.client.commands.has(name)
            ) {

                this.failed.push({

                    file,

                    error:
                        `Duplicate command detected: ${name}`

                });

                return;

            }

            // ------------------------------------------------
            // Register
            // ------------------------------------------------

            this.client.commands.set(

                name,

                command

            );

            if (command.permission) {

                permissions.registerCommand(

                    name,

                    command.permission

                );

            }

            this.loaded.push({

                name,

                file

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
    // Application Commands
    // ========================================================

    getApplicationCommands() {

        const commands = [];

        for (
            const command
            of this.client?.commands?.values() ?? []
        ) {

            if (
                !command?.data ||
                typeof command.data.toJSON !==
                "function"
            ) {

                continue;

            }

            commands.push(

                command.data.toJSON()

            );

        }

        return commands;

    }

    // ========================================================
    // Unload
    // ========================================================

    async unload(name) {

        if (!this.client?.commands) {

            return false;

        }

        const removed =
            this.client.commands.delete(name);

        if (removed) {

            this.loaded =
                this.loaded.filter(

                    command =>
                        command.name !== name

                );

            this.client.applicationCommands =
                this.getApplicationCommands();

            this.client.stats.commandsLoaded =
                this.client.commands.size;

        }

        return removed;

    }

    // ========================================================
    // Reload
    // ========================================================

    async reload(file) {

        if (!this.client) {

            throw new Error(
                "Command loader is not initialized."
            );

        }

        const existing =
            this.loaded.find(

                command =>
                    command.file === file

            );

        if (existing) {

            await this.unload(

                existing.name

            );

        }

        const result =
            await this.loadFile(file);

        this.client.applicationCommands =
            this.getApplicationCommands();

        this.client.stats.commandsLoaded =
            this.client.commands.size;

        return result;

    }

    // ========================================================
    // Results
    // ========================================================

    getLoaded() {

        return [

            ...this.loaded

        ];

    }

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

        this.client = null;

    }

}

export default new CommandLoader();