/**
 * ============================================================
 * Nocthera v1.1.0
 * Event Manager
 * ============================================================
 */

import eventService from "./eventService.js";
import eventConfig from "./eventConfig.js";

class EventManager {

    constructor() {

        this.client = null;

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        this.client = client;

        await eventService.initialize(

            client

        );

        return true;

    }

    // ========================================================
    // Configuration
    // ========================================================

    getConfig() {

        return eventService.getConfig();

    }

    setConfig(config = {}) {

        const merged =
            eventConfig.merge(config);

        if (!eventConfig.validate(merged)) {

            return false;

        }

        return eventService.setConfig(

            merged

        );

    }

    // ========================================================
    // Event State
    // ========================================================

    register(

        name,

        file,

        once = false

    ) {

        return eventService.registerState(

            name,

            file,

            once

        );

    }

    unregister(name) {

        return eventService.unregisterState(

            name

        );

    }

    get(name) {

        return eventService.get(name);

    }

    has(name) {

        return eventService.has(name);

    }

    list() {

        return eventService.list();

    }

    // ========================================================
    // Ignore / Unignore
    // ========================================================

    isIgnored(name) {

        return eventService.isIgnored(

            name

        );

    }

    ignore(name) {

        return eventService.ignore(name);

    }

    unignore(name) {

        return eventService.unignore(name);

    }

    // ========================================================
    // Critical Events
    // ========================================================

    isCritical(name) {

        return eventService.isCritical(

            name

        );

    }

    // ========================================================
    // Tracking
    // ========================================================

    recordExecution(name) {

        eventService.recordExecution(

            name

        );

    }

    recordError(name, error) {

        eventService.recordError(

            name,

            error

        );

    }

    getErrors(limit = 25) {

        return eventService.getErrors(

            limit

        );

    }

    clearErrors() {

        eventService.clearErrors();

    }

    // ========================================================
    // Statistics
    // ========================================================

    getStats() {

        return eventService.getStats();

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        await eventService.shutdown();

        this.client = null;

    }

}

export default new EventManager();