/**
 * ============================================================
 * Nocthera v1.1.0
 * Security System
 * ============================================================
 */

import SecurityService from "./securityService.js";

class SecuritySystem {

    constructor() {
        this.client = null;
        this.service = null;
        this.initialized = false;
    }

    async initialize(client) {
        if (this.initialized) return true;

        this.client = client;
        this.service = new SecurityService(client);
        await this.service.initialize();
        this.initialized = true;

        return true;
    }

    async start() {
        return this.initialized;
    }

    async shutdown() {
        this.service?.reset();
        this.service = null;
        this.client = null;
        this.initialized = false;
    }

    async handleSecurityEvent(guildId, userId, event, data = {}) {
        if (!this.service) {
            throw new Error("Security system has not been initialized.");
        }

        return this.service.handle(guildId, userId, event, data);
    }

    status() {
        return this.service?.status() ?? null;
    }

    health() {
        return this.service?.health() ?? null;
    }

    reset() {
        this.service?.reset();
    }

    get manager() {
        return this.service;
    }

    get core() {
        return this.service;
    }
}

const security = new SecuritySystem();

export const initializeSecurity = client => security.initialize(client);
export const getSecurity = () => security.service;
export const handleSecurityEvent = (...args) => security.handleSecurityEvent(...args);
export const securityStatus = () => security.status();
export const securityHealth = () => security.health();
export const resetSecurity = () => security.reset();

export default security;
