import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import verificationHandler from "../../systems/verification/verificationHandler.js";

export default {
    category: "verification",
    permission: PermissionFlagsBits.ManageGuild,
    data: new SlashCommandBuilder()
        .setName("verification")
        .setDescription("Open the verification management panel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(client, interaction) {
        return verificationHandler.dashboard(interaction);
    }
};
