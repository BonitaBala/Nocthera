import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import logging from "../../systems/logging/index.js";
import { createSystemPanel, safeJson, replyEphemeral } from "../../core/systemPanel.js";

export default {
    category: "logging",
    permission: PermissionFlagsBits.ManageGuild,
    data: new SlashCommandBuilder().setName("logging").setDescription("Open the logging management panel.").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(client, interaction) {
        const config = logging.manager.getConfig(interaction.guildId);
        return replyEphemeral(interaction, createSystemPanel({
            name: "Logging",
            emoji: "📝",
            description: "Configure event logging channels and logging categories.",
            status: config.enabled ? "🟢 Enabled" : "🔴 Disabled",
            buttons: [
                { id: "logging:toggle", label: config.enabled ? "Disable" : "Enable", emoji: "⏯️", style: config.enabled ? 4 : 3 },
                { id: "logging:channels", label: "Channels", emoji: "📢", style: 1 },
                { id: "logging:events", label: "Events", emoji: "⚙️" },
                { id: "logging:status", label: "Status", emoji: "📋" },
                { id: "logging:reset", label: "Reset", emoji: "🗑️", style: 4 }
            ]
        }));
    }
};
