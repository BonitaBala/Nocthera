/**
 * ============================================================
 * Nocthera v1.1.0
 * Community System
 * ============================================================
 */

import communityCore from "./communityCore.js";
import communityManager from "./communityManager.js";
import communityService from "./communityService.js";
import communityPanel from "./communityPanel.js";
import communityHandler from "./communityHandler.js";

class CommunitySystem {

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

        await communityCore.initialize(client);

        this.initialized = true;

    }

    // ========================================================
    // Start
    // ========================================================

    async start() {

        if (!this.initialized) {

            return;

        }

        await communityCore.start();

    }

    // ========================================================
    // Interaction Handler
    // ========================================================

    async handleInteraction(interaction) {

        return communityHandler.handleInteraction(

            interaction

        );

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        await communityCore.shutdown();

        this.client = null;

        this.initialized = false;

    }

    // ========================================================
    // System Access
    // ========================================================

    get core() {

        return communityCore;

    }

    get manager() {

        return communityManager;

    }

    get service() {

        return communityService;

    }

    get panel() {

        return communityPanel;

    }

    get handler() {

        return communityHandler;

    }

}

const community = new CommunitySystem();

export {

    communityCore,

    communityManager,

    communityService,

    communityPanel,

    communityHandler

};

export default community;