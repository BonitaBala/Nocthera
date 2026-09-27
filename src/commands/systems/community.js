import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import community from "../../systems/community/index.js";
import { createSystemPanel, safeJson, replyEphemeral } from "../../core/systemPanel.js";

export default {
    category: "community",
    permission: PermissionFlagsBits.ManageGuild,
    data: new SlashCommandBuilder().setName("community").setDescription("Open the community management panel.").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(client, interaction) {
        const config = community.manager.getConfig(interaction.guildId);
        return replyEphemeral(interaction, createSystemPanel({
            name: "Community",
            emoji: "👥",
            description: "Manage welcomes, goodbyes, autorole, member counters, announcements and community features.",
            status: config.enabled ? "🟢 Enabled" : "🔴 Disabled",
            buttons: [
                { id: "community:toggle", label: config.enabled ? "Disable" : "Enable", emoji: "⏯️", style: config.enabled ? 4 : 3 },
                { id: "community:welcome", label: "Welcome", emoji: "👋", style: 1 },
                { id: "community:autorole", label: "Auto Role", emoji: "🎭" },
                { id: "community:counter", label: "Counter", emoji: "📊" },
                { id: "community:announce", label: "Announce", emoji: "📢", style: 1 },
                { id: "community:status", label: "Status", emoji: "📋" },
                { id: "community:reset", label: "Reset", emoji: "🗑️", style: 4 }
            ]
        }));
    }
};
