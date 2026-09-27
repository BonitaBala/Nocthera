/**
 * ============================================================
 * Nocthera v1.1.0
 * Event Handler
 * ============================================================
 */

import eventManager from "./eventManager.js";

class EventHandler {

    constructor() {

        this.client = null;

    }

    // ========================================================
    // Initialize
    // ========================================================

    initialize(client) {

        if (!client) {

            throw new Error(
                "Discord client is required."
            );

        }

        this.client = client;

        return true;

    }

    // ========================================================
    // Execute Event Safely
    // ========================================================

    async execute(event, ...args) {

        if (!this.client) {

            return false;

        }

        if (!event) {

            return false;

        }

        if (
            typeof event.execute !==
            "function"
        ) {

            return false;

        }

        if (
            !event.name
        ) {

            return false;

        }

        if (
            eventManager.isIgnored(
                event.name
            )
        ) {

            return false;

        }

        try {

            eventManager.recordExecution(

                event.name

            );

            await event.execute(

                this.client,

                ...args

            );

            return true;

        } catch (error) {

            eventManager.recordError(

                event.name,

                error

            );

            return false;

        }

    }

    // ========================================================
    // Error Event
    // ========================================================

    async handleError(error) {

        eventManager.recordError(

            "error",

            error

        );

        return false;

    }

    // ========================================================
    // Warning Event
    // ========================================================

    async handleWarning(message) {

        eventManager.recordError(

            "warn",

            new Error(

                String(message)

            )

        );

        return false;

    }

    // ========================================================
    // Statistics
    // ========================================================

    getStats() {

        return eventManager.getStats();

    }

    getErrors(limit = 25) {

        return eventManager.getErrors(

            limit

        );

    }

    clearErrors() {

        eventManager.clearErrors();

    }

    // ========================================================
    // Shutdown
    // ========================================================

    shutdown() {

        this.client = null;

    }

}

export default new EventHandler();