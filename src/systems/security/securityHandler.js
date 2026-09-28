import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import security from "./index.js";
import SecuritySelfTest from "./securitySelfTest.js";

const admin = i => i.memberPermissions?.has("ManageGuild") || i.memberPermissions?.has("Administrator");

class SecurityHandler {
    async handle(i) {
        if (!i?.customId?.startsWith("security:")) return false;
        if (!admin(i)) {
            await i.reply({ content: "❌ Manage Server permission required.", flags: MessageFlags.Ephemeral });
            return true;
        }

        const [, action, key] = i.customId.split(":");
        // Prefer the module instance registered on the Discord client.
        // This keeps interaction handling tied to the exact SecuritySystem
        // instance initialized by ModuleManager.
        const securitySystem = i.client?.modules?.get?.("security") ?? security;
        const service = securitySystem?.service;
        if (!service) {
            await i.reply({ content: "❌ Security service is not initialized. Restart Nocthera and try again.", flags: MessageFlags.Ephemeral });
            return true;
        }

        const config = service.config.get(i.guildId);
        if (!config) {
            await i.reply({ content: "❌ Security configuration is unavailable.", flags: MessageFlags.Ephemeral });
            return true;
        }
        if (!i.isButton()) return false;

        if (action === "protections") return this.protections(i, config);
        if (action === "status") {
            const payload = { configuration: config, service: service.status(), health: service.health() };
            return i.reply({ content: `\`\`\`json\n${JSON.stringify(payload, null, 2).slice(0, 1850)}\n\`\`\``, flags: MessageFlags.Ephemeral });
        }
        if (action === "health") {
            return i.reply({ content: `\`\`\`json\n${JSON.stringify(service.health(), null, 2).slice(0, 1850)}\n\`\`\``, flags: MessageFlags.Ephemeral });
        }
        if (action === "selftest") {
            // Self-tests touch multiple in-memory engines and can take longer
            // than Discord's 3-second interaction acknowledgement window.
            // Defer first, then edit the original response with the report.
            if (!i.deferred && !i.replied) {
                await i.deferReply({ flags: MessageFlags.Ephemeral });
            }
            try {
                const report = await SecuritySelfTest.run(securitySystem.client, { guildId: i.guildId });
                await i.editReply({ content: SecuritySelfTest.format(report) });
            } catch (error) {
                await i.editReply({
                    content: `❌ **Nocthera Security Self-Test failed.**\n${String(error?.message ?? error).slice(0, 1800)}`
                }).catch(() => {});
            }
            return true;
        }
        if (action === "reset") {
            securitySystem.reset();
            return i.reply({ content: "✅ Security runtime reset.", flags: MessageFlags.Ephemeral });
        }
        if (action === "toggle") {
            if (!(key in config) || typeof config[key]?.enabled !== "boolean") {
                await i.reply({ content: "❌ Invalid security protection.", flags: MessageFlags.Ephemeral });
                return true;
            }
            const enabled = !config[key].enabled;
            service.config.update(i.guildId, { [key]: { ...config[key], enabled } });
            return i.reply({ content: `✅ ${key} ${enabled ? "enabled" : "disabled"}.`, flags: MessageFlags.Ephemeral });
        }
        return false;
    }

    async protections(i, c) {
        const row = new ActionRowBuilder();
        for (const [key, label] of [["antiRaid", "Anti Raid"], ["antiSpam", "Anti Spam"], ["antiBot", "Anti Bot"], ["antiNuke", "Anti Nuke"]]) {
            row.addComponents(new ButtonBuilder().setCustomId(`security:toggle:${key}`).setLabel(`${label}: ${c[key].enabled ? "ON" : "OFF"}`).setStyle(c[key].enabled ? ButtonStyle.Success : ButtonStyle.Secondary));
        }
        row.addComponents(new ButtonBuilder().setCustomId("security:selftest").setLabel("Run Self-Test").setEmoji("🧪").setStyle(ButtonStyle.Primary));
        await i.reply({ content: "🛡️ Toggle security protections or run a safe internal self-test.", components: [row], flags: MessageFlags.Ephemeral });
        return true;
    }
}

export default new SecurityHandler();
