import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import tickets from "../../systems/tickets/index.js";
import { createSystemPanel, replyEphemeral } from "../../core/systemPanel.js";

export default {
    category: "tickets",
    permission: PermissionFlagsBits.ManageChannels,
    data: new SlashCommandBuilder().setName("tickets").setDescription("Open the ticket management panel.").setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(client, interaction) {
        const config = tickets.manager.getConfig(interaction.guildId);
        return replyEphemeral(interaction, createSystemPanel({
            name: "Tickets",
            emoji: "🎫",
            description: "Configure ticket channels, support roles, transcripts and ticket lifecycle settings.",
            status: config.enabled ? "🟢 Enabled" : "🔴 Disabled",
            buttons: [
                { id: "tickets:toggle", label: config.enabled ? "Disable" : "Enable", emoji: "⏯️", style: config.enabled ? 4 : 3 },
                { id: "tickets:deploy", label: "Deploy Panel", emoji: "📤", style: 3 },
                { id: "tickets:settings", label: "Settings", emoji: "⚙️", style: 1 },
                { id: "tickets:status", label: "Status", emoji: "📋" },
                { id: "tickets:close", label: "Close Current", emoji: "🔒", style: 4 }
            ]
        }));
    }
};
