import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import moderation from "../../systems/moderation/index.js";
import { createSystemPanel, replyEphemeral } from "../../core/systemPanel.js";

export default {
    category: "moderation",
    permission: PermissionFlagsBits.ModerateMembers,
    data: new SlashCommandBuilder().setName("moderation").setDescription("Open the moderation management panel.").setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(client, interaction) {
        const config = moderation.manager.getConfig(interaction.guildId);
        return replyEphemeral(interaction, createSystemPanel({
            name: "Moderation",
            emoji: "🔨",
            description: "Configure moderation and perform member actions from one control panel.",
            status: config.enabled ? "🟢 Enabled" : "🔴 Disabled",
            buttons: [
                { id: "moderation:toggle", label: config.enabled ? "Disable" : "Enable", emoji: "⏯️", style: config.enabled ? 4 : 3 },
                { id: "moderation:warn", label: "Warn", emoji: "⚠️", style: 1 },
                { id: "moderation:timeout", label: "Timeout", emoji: "⏳", style: 1 },
                { id: "moderation:kick", label: "Kick", emoji: "👢", style: 4 },
                { id: "moderation:ban", label: "Ban", emoji: "🔨", style: 4 },
                { id: "moderation:settings", label: "Settings", emoji: "⚙️" },
                { id: "moderation:status", label: "Status", emoji: "📋" }
            ]
        }));
    }
};
