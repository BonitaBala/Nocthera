import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import setupHandler from "../../systems/setup/setupHandler.js";

export default {
    category: "core",
    permission: PermissionFlagsBits.ManageGuild,
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Open Nocthera's guided server security and protection setup.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(client, interaction) {
        return setupHandler.dashboard(interaction);
    }
};
