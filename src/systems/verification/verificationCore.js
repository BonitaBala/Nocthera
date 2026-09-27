/** Nocthera v1.1.0 - Verification Core */

import verificationManager from "./verificationManager.js";

class VerificationCore {
    constructor() { this.client = null; this.initialized = false; }
    async initialize(client) { if (this.initialized) return; this.client = client; await verificationManager.initialize(client); this.initialized = true; }
    async start() {}
    async shutdown() { await verificationManager.shutdown(); this.client = null; this.initialized = false; }
    verify(member) { return verificationManager.verify(member); }
    getConfig(guildId) { return verificationManager.getConfig(guildId); }
    setConfig(guildId, config) { return verificationManager.setConfig(guildId, config); }
}

export default new VerificationCore();
