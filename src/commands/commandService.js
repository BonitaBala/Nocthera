/**
 * ============================================================
 * Nocthera v1.1.0
 * Command Service
 * ============================================================
 */

import commandConfig from "./commandConfig.js";

class CommandService {

    constructor() {

        this.client = null;

        this.config = commandConfig.create();

        this.cooldowns = new Map();

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        this.client = client;

        return true;

    }

    // ========================================================
    // Configuration
    // ========================================================

    getConfig() {

        return this.config;

    }

    setConfig(config = {}) {

        this.config = commandConfig.merge(

            config

        );

        return this.config;

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
    // Command Validation
    // ========================================================

    validate(command) {

        if (!command) {

            return false;

        }

        if (
            typeof command.execute !==
            "function"
        ) {

            return false;

        }

        const name =
            this.getCommandName(command);

        if (!name) {

            return false;

        }

        return true;

    }

    // ========================================================
    // Command Collection
    // ========================================================

    getCommands() {

        if (!this.client?.commands) {

            return new Map();

        }

        return this.client.commands;

    }

    getCommand(name) {

        return this.getCommands().get(

            name

        ) ?? null;

    }

    hasCommand(name) {

        return this.getCommands().has(

            name

        );

    }

    listCommands() {

        return [

            ...this.getCommands().keys()

        ];

    }

    // ========================================================
    // Categories
    // ========================================================

    getCategory(command) {

        return command?.category ?? "core";

    }

    getCommandsByCategory(category) {

        return [

            ...this.getCommands().values()

        ].filter(

            command =>

                this.getCategory(command) ===

                category

        );

    }

    // ========================================================
    // Cooldowns
    // ========================================================

    getCooldownKey(

        userId,

        commandName

    ) {

        return `${userId}:${commandName}`;

    }

    isOnCooldown(

        userId,

        commandName

    ) {

        const key =
            this.getCooldownKey(

                userId,

                commandName

            );

        const expires =
            this.cooldowns.get(key);

        if (!expires) {

            return false;

        }

        if (Date.now() >= expires) {

            this.cooldowns.delete(key);

            return false;

        }

        return true;

    }

    getCooldownRemaining(

        userId,

        commandName

    ) {

        const key =
            this.getCooldownKey(

                userId,

                commandName

            );

        const expires =
            this.cooldowns.get(key);

        if (!expires) {

            return 0;

        }

        return Math.max(

            0,

            expires - Date.now()

        );

    }

    setCooldown(

        userId,

        commandName,

        duration = null

    ) {

        const cooldown =
            duration ??
            this.config.limits.cooldown;

        if (cooldown <= 0) {

            return;

        }

        const key =
            this.getCooldownKey(

                userId,

                commandName

            );

        this.cooldowns.set(

            key,

            Date.now() + cooldown

        );

    }

    clearCooldown(

        userId,

        commandName

    ) {

        return this.cooldowns.delete(

            this.getCooldownKey(

                userId,

                commandName

            )

        );

    }

    // ========================================================
    // Command Execution
    // ========================================================

    async execute(

        command,

        interaction

    ) {

        if (!this.validate(command)) {

            throw new Error(

                `Invalid command: ${
                    this.getCommandName(command) ??
                    "unknown"
                }`

            );

        }

        if (!interaction) {

            throw new Error(

                "Interaction is required."

            );

        }

        const commandName =
            this.getCommandName(command);

        const userId =
            interaction.user?.id;

        if (
            userId &&
            this.isOnCooldown(

                userId,

                commandName

            )
        ) {

            return {

                success: false,

                cooldown: true,

                remaining:
                    this.getCooldownRemaining(

                        userId,

                        commandName

                    )

            };

        }

        await command.execute(

            this.client,

            interaction

        );

        if (userId) {

            this.setCooldown(

                userId,

                commandName

            );

        }

        return {

            success: true,

            cooldown: false

        };

    }

    // ========================================================
    // Cleanup
    // ========================================================

    cleanupCooldowns() {

        const now = Date.now();

        for (
            const [
                key,
                expires
            ] of this.cooldowns
        ) {

            if (expires <= now) {

                this.cooldowns.delete(key);

            }

        }

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        this.cooldowns.clear();

        this.client = null;

    }

}

export default new CommandService();