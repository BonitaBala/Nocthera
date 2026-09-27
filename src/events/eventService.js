/**
 * ============================================================
 * Nocthera v1.1.0
 * Event Service
 * ============================================================
 */

import eventConfig from "./eventConfig.js";

class EventService {

    constructor() {

        this.client = null;

        this.config = eventConfig.create();

        this.events = new Map();

        this.errors = [];

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

        return true;

    }

    // ========================================================
    // Configuration
    // ========================================================

    getConfig() {

        return this.config;

    }

    setConfig(config = {}) {

        const merged =
            eventConfig.merge(config);

        if (!eventConfig.validate(merged)) {

            return false;

        }

        this.config = merged;

        return this.config;

    }

    // ========================================================
    // Event State
    // ========================================================

    registerState(

        name,

        file,

        once = false

    ) {

        if (!name) {

            return false;

        }

        if (this.events.has(name)) {

            return false;

        }

        this.events.set(

            name,

            {

                name,

                file,

                once: Boolean(once),

                loadedAt: Date.now(),

                executions: 0,

                errors: 0

            }

        );

        return true;

    }

    unregisterState(name) {

        return this.events.delete(name);

    }

    get(name) {

        return this.events.get(name) ?? null;

    }

    has(name) {

        return this.events.has(name);

    }

    list() {

        return [

            ...this.events.values()

        ];

    }

    // ========================================================
    // Ignored Events
    // ========================================================

    isIgnored(name) {

        return this.config.ignoredEvents.includes(

            name

        );

    }

    ignore(name) {

        if (!name) {

            return false;

        }

        if (
            !this.config.ignoredEvents.includes(
                name
            )
        ) {

            this.config.ignoredEvents.push(

                name

            );

        }

        return true;

    }

    unignore(name) {

        const index =
            this.config.ignoredEvents.indexOf(

                name

            );

        if (index === -1) {

            return false;

        }

        this.config.ignoredEvents.splice(

            index,

            1

        );

        return true;

    }

    // ========================================================
    // Critical Events
    // ========================================================

    isCritical(name) {

        return this.config.criticalEvents.includes(

            name

        );

    }

    // ========================================================
    // Execution Tracking
    // ========================================================

    recordExecution(name) {

        const event =
            this.events.get(name);

        if (!event) {

            return;

        }

        event.executions++;

    }

    recordError(name, error) {

        const event =
            this.events.get(name);

        if (event) {

            event.errors++;

        }

        this.errors.push({

            event: name,

            message:
                error?.message ??
                String(error),

            timestamp: Date.now()

        });

        if (this.errors.length > 100) {

            this.errors.shift();

        }

    }

    // ========================================================
    // Error History
    // ========================================================

    getErrors(limit = 25) {

        const safeLimit =
            Number.isFinite(limit)
                ? Math.max(1, Math.floor(limit))
                : 25;

        return this.errors.slice(

            -safeLimit

        );

    }

    clearErrors() {

        this.errors.length = 0;

    }

    // ========================================================
    // Statistics
    // ========================================================

    getStats() {

        let executions = 0;

        let errors = 0;

        for (
            const event
            of this.events.values()
        ) {

            executions += event.executions;

            errors += event.errors;

        }

        return {

            registered:
                this.events.size,

            executions,

            errors,

            ignored:
                this.config.ignoredEvents.length

        };

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        this.events.clear();

        this.errors.length = 0;

        this.client = null;

    }

}

export default new EventService();