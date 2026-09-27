import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import roles from "../../systems/roles/index.js";
import { createSystemPanel, replyEphemeral } from "../../core/systemPanel.js";

export default {
    category: "roles",
    permission: PermissionFlagsBits.ManageRoles,
    data: new SlashCommandBuilder().setName("roles").setDescription("Open the role management panel.").setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(client, interaction) {
        const config = roles.manager.getConfig(interaction.guildId);
        return replyEphemeral(interaction, createSystemPanel({
            name: "Roles",
            emoji: "🎭",
            description: "Create, manage and publish self-role panels and configure role features.",
            status: config.enabled ? "🟢 Enabled" : "🔴 Disabled",
            buttons: [
                { id: "roles:toggle", label: config.enabled ? "Disable" : "Enable", emoji: "⏯️", style: config.enabled ? 4 : 3 },
                { id: "roles:create", label: "Create Panel", emoji: "➕", style: 3 },
                { id: "roles:manage", label: "Manage Panels", emoji: "📝", style: 1 },
                { id: "roles:status", label: "Status", emoji: "📋" },
                { id: "roles:reset", label: "Reset", emoji: "🗑️", style: 4 }
            ]
        }));
    }
};
