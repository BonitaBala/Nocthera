/** Nocthera v1.1.0 - Verification System */

import verificationCore from "./verificationCore.js";
import verificationManager from "./verificationManager.js";
import verificationService from "./verificationService.js";
import verificationPanel from "./verificationPanel.js";
import verificationHandler from "./verificationHandler.js";
import verificationConfig from "./verificationConfig.js";

class VerificationSystem {
    constructor() { this.client = null; this.initialized = false; }
    async initialize(client) { if (this.initialized) return; this.client = client; await verificationCore.initialize(client); this.initialized = true; }
    async start() { if (this.initialized) await verificationCore.start(); }
    async shutdown() { await verificationCore.shutdown(); this.client = null; this.initialized = false; }
    async handleInteraction(interaction) { return verificationHandler.handle(interaction); }
    get core() { return verificationCore; }
    get manager() { return verificationManager; }
    get service() { return verificationService; }
    get panel() { return verificationPanel; }
    get handler() { return verificationHandler; }
    get config() { return verificationConfig; }
}

const verification = new VerificationSystem();
export { verificationCore, verificationManager, verificationService, verificationPanel, verificationHandler, verificationConfig };
export default verification;
