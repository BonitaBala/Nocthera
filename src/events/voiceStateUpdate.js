import voice from "../systems/voice/index.js";
import logger from "../core/logger.js";

export default {
    name: "voiceStateUpdate",
    once: false,
    async execute(client, oldState, newState) {
        try {
            const system = client.modules?.get?.("voice") ?? voice;
            if (system?.service) await system.service.handleVoiceStateUpdate(oldState, newState);
        } catch (error) {
            logger.error(error?.stack ?? error);
        }
    }
};
