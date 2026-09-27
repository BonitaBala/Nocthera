import { MessageFlags } from "discord.js";
import logger from "./logger.js";

const registry = new Map();

export function registerSystemSelfTest(name, fn) {
    if (name && typeof fn === "function") registry.set(name, fn);
}

class SystemSelfTestHandler {
    async handle(interaction) {
        if (!interaction?.isButton?.() || !interaction.customId?.endsWith(":selftest")) return false;
        if (interaction.replied || interaction.deferred) return true;

        // A self-test can take long enough to cross Discord's 3-second initial
        // response window. Defer immediately so the final report can safely use
        // editReply instead of racing the interaction expiry.
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } catch {
            return true;
        }

        const system = interaction.customId.slice(0, -":selftest".length);
        if (!registry.has(system)) {
            // Let the system-specific handler process its own self-test.
            // Security, for example, has a dedicated safe self-test implementation.
            try { await interaction.deleteReply(); } catch {}
            return false;
        }

        try {
            const report = await registry.get(system)(interaction);
            const lines = Array.isArray(report) ? report : [String(report ?? "Self-test completed.")];
            await interaction.editReply({ content: `🧪 **${system} Self-Test**\n${lines.join("\n")}`.slice(0, 1900) }).catch(() => {});
        } catch (error) {
            logger.error(`${system} self-test failed: ${error?.stack ?? error}`);
            await interaction.editReply({ content: `❌ **${system} Self-Test failed.**\n[0;31m${String(error?.message ?? error).slice(0, 1500)}[0m`, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
        return true;
    }
}

export default new SystemSelfTestHandler();
