/**
 * ============================================================
 * Nocthera v1.1.0
 * Internal Event Bus
 * ============================================================
 */

import logger from "./logger.js";

class EventBus {

    constructor() {

        this.events = new Map();

    }

    /**
     * ========================================================
     * Subscribe
     * ========================================================
     */

    on(event, listener) {

        if (!this.events.has(event)) {

            this.events.set(event, new Set());

        }

        this.events.get(event).add(listener);

        logger.debug(`Subscribed: ${event}`);

    }

    /**
     * ========================================================
     * Subscribe Once
     * ========================================================
     */

    once(event, listener) {

        const wrapper = async (...args) => {

            await listener(...args);

            this.off(event, wrapper);

        };

        this.on(event, wrapper);

    }

    /**
     * ========================================================
     * Unsubscribe
     * ========================================================
     */

    off(event, listener) {

        this.events.get(event)?.delete(listener);

    }

    /**
     * ========================================================
     * Emit
     * ========================================================
     */

    async emit(event, payload = {}) {

        if (!this.events.has(event))
            return;

        const listeners = [...this.events.get(event)];

        for (const listener of listeners) {

            try {

                await listener(payload);

            }

            catch (error) {

                logger.error(error.stack);

            }

        }

    }

    /**
     * ========================================================
     * Clear Event
     * ========================================================
     */

    clear(event) {

        this.events.delete(event);

    }

    /**
     * ========================================================
     * Clear All
     * ========================================================
     */

    clearAll() {

        this.events.clear();

    }

    /**
     * ========================================================
     * Information
     * ========================================================
     */

    listenerCount(event) {

        return this.events.get(event)?.size ?? 0;

    }

    eventCount() {

        return this.events.size;

    }

    eventsList() {

        return [...this.events.keys()];

    }

}

export default new EventBus();