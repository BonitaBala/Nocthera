/**
 * ============================================================
 * Nocthera v1.1.0
 * Ready Event
 * ============================================================
 */

import logger from "../core/logger.js";

import registerPresence from "./ready/registerPresence.js";

import registerStatistics from "../services/startup/registerStatistics.js";

import registerHealthMonitor from "../services/startup/registerHealthMonitor.js";

import registerStatusRotation from "../services/startup/registerStatusRotation.js";

import startupBanner from "../services/startup/startupBanner.js";

export default {

    name: "clientReady",

    once: true,

    async execute(client) {

        logger.success(`${client.user.tag} is online.`);

        await registerPresence(client);

        await registerStatistics(client);

        registerHealthMonitor(client);

        registerStatusRotation(client);

        startupBanner(client);

        client.stats.guildsProtected = client.guilds.cache.size;

        client.stats.bootCompleted = Date.now();

        logger.success("Startup completed.");

    }

};