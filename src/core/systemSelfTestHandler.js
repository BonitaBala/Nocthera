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

        // Only claim the interaction when this generic registry actually owns it.
        // System-specific self-tests (for example security:selftest) are handled
        // by their own system handler. Deferring here and then deleting the reply
        // would still leave the interaction acknowledged and make the real handler
        // fail with InteractionAlreadyReplied.
        const system = interaction.customId.slice(0, -":selftest".length);
        const test = registry.get(system);
        if (!test) return false;

        // Registered self-tests can take longer than Discord's initial response
        // window, so acknowledge before running the test.
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } catch {
            return true;
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
