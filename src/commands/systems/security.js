import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import security from "../../systems/security/index.js";
import { createSystemPanel, replyEphemeral } from "../../core/systemPanel.js";

export default {
    category: "security",
    permission: PermissionFlagsBits.ManageGuild,
    data: new SlashCommandBuilder().setName("security").setDescription("Open the security management panel.").setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(client, interaction) {
        return replyEphemeral(interaction, createSystemPanel({
            name: "Security",
            emoji: "🛡️",
            description: "Configure anti-raid, anti-spam, anti-bot, anti-nuke and security logging protections.",
            status: "🟢 Protection system loaded",
            buttons: [
                { id: "security:protections", label: "Protections", emoji: "🛡️", style: 1 },
                { id: "security:status", label: "Status", emoji: "📋" },
                { id: "security:health", label: "Health", emoji: "❤️" },
                { id: "security:selftest", label: "Self-Test", emoji: "🧪", style: 1 },
                { id: "security:reset", label: "Reset Runtime", emoji: "🔄", style: 4 }
            ]
        }));
    }
};
