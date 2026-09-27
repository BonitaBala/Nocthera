/**
 * ============================================================
 * Nocthera v1.1.0
 * Startup Banner
 * ============================================================
 */

import os from "node:os";
import logger from "../../core/logger.js";

export default function startupBanner(client) {

    const uptime = process.uptime().toFixed(2);

    const memory = process.memoryUsage();

    const memoryMB = (memory.heapUsed / 1024 / 1024).toFixed(2);

    const line = "==============================================================";

    console.log("");

    console.log(line);

    console.log("                    🌙 NOCTHERA");

    console.log(line);

    console.log(` Version        : ${client.version}`);

    console.log(` Codename       : ${client.codename}`);

    console.log(` Environment    : ${client.development ? "Development" : "Production"}`);

    console.log(` Node.js        : ${process.version}`);

    console.log(` Platform       : ${os.platform()} ${os.arch()}`);

    console.log(` Guilds         : ${client.guilds.cache.size}`);

    console.log(` Users          : ${client.users.cache.size}`);

    console.log(` Commands       : ${client.commands.size}`);

    console.log(` Events         : ${client.events.size}`);

    console.log(` Modules        : ${client.modules.size}`);

    console.log(` Memory         : ${memoryMB} MB`);

    console.log(` Uptime         : ${uptime} sec`);

    console.log(` Ping           : ${client.ws.ping} ms`);

    console.log(line);

    logger.success("Startup banner generated.");

}