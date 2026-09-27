/**
 * ============================================================
 * Nocthera v1.1.0
 * Discord Event System
 * ============================================================
 */

import eventConfig from "./eventConfig.js";
import eventService from "./eventService.js";
import eventManager from "./eventManager.js";
import eventLoader from "./eventLoader.js";
import eventHandler from "./eventHandler.js";
import eventRegistry from "./eventRegistry.js";

class EventSystem {

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

        await eventManager.initialize(

            client

        );

        eventHandler.initialize(

            client

        );

        await eventLoader.initialize(

            client

        );

        eventRegistry.sync();

        this.initialized = true;

    }

    // ========================================================
    // Load
    // ========================================================

    async load(directory) {

        if (!this.initialized) {

            throw new Error(

                "Event system is not initialized."

            );

        }

        const result =
            await eventLoader.load(

                directory

            );

        eventRegistry.sync();

        return result;

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        await eventLoader.shutdown();

        eventHandler.shutdown();

        await eventManager.shutdown();

        eventRegistry.clear();

        this.client = null;

        this.initialized = false;

    }

    // ========================================================
    // Accessors
    // ========================================================

    get config() {

        return eventConfig;

    }

    get service() {

        return eventService;

    }

    get manager() {

        return eventManager;

    }

    get loader() {

        return eventLoader;

    }

    get handler() {

        return eventHandler;

    }

    get registry() {

        return eventRegistry;

    }

}

const events = new EventSystem();

export {

    eventConfig,

    eventService,

    eventManager,

    eventLoader,

    eventHandler,

    eventRegistry

};

export default events;