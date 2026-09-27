/**
 * ============================================================
 * Nocthera v1.1.0
 * Command System
 * ============================================================
 */

import commandConfig from "./commandConfig.js";
import commandService from "./commandService.js";
import commandManager from "./commandManager.js";
import commandLoader from "./commandLoader.js";
import commandHandler from "./commandHandler.js";
import commandRegistry from "./commandRegistry.js";

class CommandSystem {

    constructor() {

        this.client = null;

        this.initialized = false;

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        if (this.initialized) {

            return;

        }

        this.client = client;

        if (!client.commands) {

            client.commands = new Map();

        }

        await commandManager.initialize(

            client

        );

        await commandLoader.initialize(

            client

        );

        commandRegistry.sync();

        this.initialized = true;

    }

    // ========================================================
    // Load Commands
    // ========================================================

    async load(directory) {

        const result =
            await commandLoader.load(

                directory

            );

        commandRegistry.sync();

        return result;

    }

    // ========================================================
    // Interaction Handler
    // ========================================================

    async handleInteraction(interaction) {

        return commandHandler.handle(

            interaction

        );

    }

    async handleAutocomplete(interaction) {

        return commandHandler.handleAutocomplete(

            interaction

        );

    }

    async handleContextMenu(interaction) {

        return commandHandler.handleContextMenu(

            interaction

        );

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        await commandLoader.shutdown();

        await commandManager.shutdown();

        commandRegistry.clear();

        this.client = null;

        this.initialized = false;

    }

    // ========================================================
    // Accessors
    // ========================================================

    get config() {

        return commandConfig;

    }

    get service() {

        return commandService;

    }

    get manager() {

        return commandManager;

    }

    get loader() {

        return commandLoader;

    }

    get handler() {

        return commandHandler;

    }

    get registry() {

        return commandRegistry;

    }

}

const commands = new CommandSystem();

export {

    commandConfig,

    commandService,

    commandManager,

    commandLoader,

    commandHandler,

    commandRegistry

};

export default commands;