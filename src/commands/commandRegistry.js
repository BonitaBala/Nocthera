/**
 * ============================================================
 * Nocthera v1.1.0
 * Command Registry
 * ============================================================
 */

import commandManager from "./commandManager.js";

class CommandRegistry {

    constructor() {

        this.registry = new Map();

    }

    // ========================================================
    // Command Name
    // ========================================================

    getCommandName(command) {

        if (!command) {

            return null;

        }

        if (
            typeof command.name ===
            "string"
        ) {

            return command.name;

        }

        if (
            typeof command.data?.name ===
            "string"
        ) {

            return command.data.name;

        }

        if (
            typeof command.data?.toJSON ===
            "function"
        ) {

            return command.data.toJSON()?.name ?? null;

        }

        return null;

    }

    // ========================================================
    // Register
    // ========================================================

    register(command) {

        const name =
            this.getCommandName(command);

        if (
            !name ||
            typeof command?.execute !==
            "function"
        ) {

            return false;

        }

        const registered =
            commandManager.register(

                command

            );

        if (!registered) {

            return false;

        }

        this.registry.set(

            name,

            {

                name,

                description:
                    command.data?.description ??
                    command.description ??
                    "",

                category:
                    command.category ??
                    "core",

                guildOnly:
                    Boolean(
                        command.guildOnly
                    ),

                defaultMemberPermissions:
                    command.defaultMemberPermissions ??
                    null

            }

        );

        return true;

    }

    // ========================================================
    // Remove
    // ========================================================

    unregister(name) {

        this.registry.delete(name);

        return commandManager.unregister(

            name

        );

    }

    // ========================================================
    // Get
    // ========================================================

    get(name) {

        return this.registry.get(

            name

        ) ?? null;

    }

    // ========================================================
    // Has
    // ========================================================

    has(name) {

        return this.registry.has(name);

    }

    // ========================================================
    // List
    // ========================================================

    list() {

        return [

            ...this.registry.values()

        ];

    }

    // ========================================================
    // Categories
    // ========================================================

    getCategory(category) {

        return this.list().filter(

            command =>

                command.category ===
                category

        );

    }

    // ========================================================
    // Slash Command JSON
    // ========================================================

    toJSON() {

        const commands = [];

        const client =
            commandManager.client;

        for (
            const command
            of client?.commands?.values() ?? []
        ) {

            if (
                typeof command.data?.toJSON ===
                "function"
            ) {

                commands.push(

                    command.data.toJSON()

                );

                continue;

            }

            if (command.data) {

                commands.push(

                    command.data

                );

            }

        }

        return commands;

    }

    // ========================================================
    // Sync Registry
    // ========================================================

    sync() {

        this.registry.clear();

        const client =
            commandManager.client;

        for (
            const command
            of client?.commands?.values() ?? []
        ) {

            const name =
                this.getCommandName(command);

            if (!name) {

                continue;

            }

            this.registry.set(

                name,

                {

                    name,

                    description:
                        command.data?.description ??
                        command.description ??
                        "",

                    category:
                        command.category ??
                        "core",

                    guildOnly:
                        Boolean(
                            command.guildOnly
                        ),

                    defaultMemberPermissions:
                        command.defaultMemberPermissions ??
                        null

                }

            );

        }

        return this.list();

    }

    // ========================================================
    // Clear
    // ========================================================

    clear() {

        this.registry.clear();

    }

}

export default new CommandRegistry();