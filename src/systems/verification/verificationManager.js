/** Nocthera v1.1.0 - Verification Manager */

import verificationService from "./verificationService.js";

class VerificationManager {
    constructor() { this.client = null; }
    async initialize(client) { this.client = client; await verificationService.initialize(client); }
    getConfig(guildId) { return verificationService.get(guildId); }
    setConfig(guildId, config) { return verificationService.set(guildId, config); }
    enable(guildId) { return verificationService.enable(guildId); }
    disable(guildId) { return verificationService.disable(guildId); }
    reset(guildId) { return verificationService.reset(guildId); }
    isEnabled(guildId) { return verificationService.isEnabled(guildId); }
    verify(member, options = {}) { return verificationService.verify(member, options); }
    createCaptcha(guildId, userId) { return verificationService.createCaptcha(guildId, userId); }
    consumeCaptcha(guildId, userId, code) { return verificationService.consumeCaptcha(guildId, userId, code); }
    async shutdown() { await verificationService.shutdown(); this.client = null; }
}

export default new VerificationManager();
