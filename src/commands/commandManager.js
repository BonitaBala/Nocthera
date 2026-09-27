/**
 * ============================================================
 * Nocthera v1.1.0
 * Command Manager
 * ============================================================
 */

import commandService from "./commandService.js";
import commandConfig from "./commandConfig.js";

class CommandManager {

    constructor() {

        this.client = null;

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        this.client = client;

        await commandService.initialize(

            client

        );

        return true;

    }

    // ========================================================
    // Configuration
    // ========================================================

    getConfig() {

        return commandService.getConfig();

    }

    setConfig(config = {}) {

        const merged =
            commandConfig.merge(config);

        if (!commandConfig.validate(merged)) {

            return false;

        }

        return commandService.setConfig(

            merged

        );

    }

    // ========================================================
    // Commands
    // ========================================================

    get(name) {

        return commandService.getCommand(

            name

        );

    }

    has(name) {

        return commandService.hasCommand(

            name

        );

    }

    list() {

        return commandService.listCommands();

    }

    getByCategory(category) {

        return commandService.getCommandsByCategory(

            category

        );

    }

    // ========================================================
    // Registration
    // ========================================================

    register(command) {

        if (!commandService.validate(command)) {

            return false;

        }

        if (!this.client?.commands) {

            return false;

        }

        if (!command?.data) {

            return false;

        }

        let name = null;

        if (
            typeof command.data.name ===
            "string"
        ) {

            name = command.data.name;

        } else if (
            typeof command.data.toJSON ===
            "function"
        ) {

            name =
                command.data.toJSON()?.name ??
                null;

        }

        if (!name) {

            return false;

        }

        if (
            this.client.commands.has(name)
        ) {

            return false;

        }

        this.client.commands.set(

            name,

            command

        );

        return true;

    }

    unregister(name) {

        if (!this.client?.commands) {

            return false;

        }

        return this.client.commands.delete(

            name

        );

    }

    // ========================================================
    // Execute
    // ========================================================

    async execute(

        command,

        interaction

    ) {

        return commandService.execute(

            command,

            interaction

        );

    }

    async executeByName(

        name,

        interaction

    ) {

        const command = this.get(name);

        if (!command) {

            return {

                success: false,

                reason: "COMMAND_NOT_FOUND"

            };

        }

        return this.execute(

            command,

            interaction

        );

    }

    // ========================================================
    // Cooldowns
    // ========================================================

    isOnCooldown(

        userId,

        commandName

    ) {

        return commandService.isOnCooldown(

            userId,

            commandName

        );

    }

    getCooldownRemaining(

        userId,

        commandName

    ) {

        return commandService.getCooldownRemaining(

            userId,

            commandName

        );

    }

    clearCooldown(

        userId,

        commandName

    ) {

        return commandService.clearCooldown(

            userId,

            commandName

        );

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        commandService.shutdown();

        this.client = null;

    }

}

export default new CommandManager();