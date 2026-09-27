import logger from "../core/logger.js";
import nsfw from "../systems/nsfw/index.js";
import security from "../systems/security/index.js";

export default {
    name: "messageCreate",
    once: false,
    async execute(client, message) {
        if (!message || message.author?.bot || !message.guild) return;
        try {
            const securitySystem = client.modules?.get?.("security") ?? security;
            const service = securitySystem?.service;
            if (service) await service.handleMessage(message);

            if (message.content?.startsWith("!")) {
                const handled = await nsfw.handleMessage(message);
                if (handled) return;
            }
            if (client.development) logger.debug(`[${message.guild.name}] ${message.author.tag}: ${message.content}`);
        } catch (error) { logger.error(error?.stack ?? error); }
    }
};
