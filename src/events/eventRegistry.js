/**
 * ============================================================
 * Nocthera v1.1.0
 * Event Registry
 * ============================================================
 */

import eventManager from "./eventManager.js";

class EventRegistry {

    constructor() {

        this.registry = new Map();

    }

    // ========================================================
    // Register
    // ========================================================

    register(event) {

        if (
            !event?.name ||
            typeof event.execute !==
            "function"
        ) {

            return false;

        }

        this.registry.set(

            event.name,

            {

                name: event.name,

                once: Boolean(event.once),

                critical:
                    eventManager.isCritical(
                        event.name
                    )

            }

        );

        return true;

    }

    // ========================================================
    // Remove
    // ========================================================

    unregister(name) {

        return this.registry.delete(name);

    }

    // ========================================================
    // Get
    // ========================================================

    get(name) {

        return this.registry.get(name) ?? null;

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
    // Critical Events
    // ========================================================

    getCritical() {

        return this.list().filter(

            event => event.critical

        );

    }

    // ========================================================
    // Sync
    // ========================================================

    sync() {

        this.registry.clear();

        for (
            const event
            of eventManager.list()
        ) {

            this.registry.set(

                event.name,

                {

                    name: event.name,

                    once: Boolean(event.once),

                    critical:
                        eventManager.isCritical(
                            event.name
                        ),

                    file: event.file

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

export default new EventRegistry();