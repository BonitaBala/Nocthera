import logger from "../core/logger.js";
import security from "../systems/security/index.js";

export default {
    name: "guildMemberAdd",
    once: false,
    async execute(client, member) {
        try {
            const securitySystem = client.modules?.get?.("security") ?? security;
            const service = securitySystem?.service;
            if (service) await service.handleMemberJoin(member);
        } catch (error) { logger.error(error?.stack ?? error); }
    }
};
