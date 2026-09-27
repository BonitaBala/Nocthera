import voiceService from "./voiceService.js";

class VoiceSystem {
    constructor() {
        this.service = voiceService;
        this.client = null;
    }

    async initialize(client) {
        this.client = client;
        return this.service.initialize(client);
    }

    async shutdown() {
        this.client = null;
    }
}

export default new VoiceSystem();
