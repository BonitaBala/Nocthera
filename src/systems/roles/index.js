/**
 * ============================================================
 * Nocthera v1.1.0
 * Roles System
 * ============================================================
 */

import rolesCore from "./rolesCore.js";
import rolesManager from "./rolesManager.js";
import rolesService from "./rolesService.js";

class RolesSystem {

    constructor() {

        this.client = null;

        this.initialized = false;

    }

    /**
     * ========================================================
     * Initialize
     * ========================================================
     */

    async initialize(client) {

        if (this.initialized) {
            return;
        }

        this.client = client;

        await rolesCore.initialize(client);

        this.initialized = true;

    }

    /**
     * ========================================================
     * Start
     * ========================================================
     */

    async start() {

        if (!this.initialized) {
            return;
        }

        await rolesCore.start();

    }

    /**
     * ========================================================
     * Shutdown
     * ========================================================
     */

    async shutdown() {

        await rolesCore.shutdown();

        this.client = null;

        this.initialized = false;

    }

    /**
     * ========================================================
     * Exposed API
     * ========================================================
     */

    get core() {

        return rolesCore;

    }

    get manager() {

        return rolesManager;

    }

    get service() {

        return rolesService;

    }

}

const roles = new RolesSystem();

export {

    rolesCore,

    rolesManager,

    rolesService

};

export default roles;