/**
 * ============================================================
 * Nocthera v1.1.0
 * Embed Command
 * ============================================================
 */

import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import embeds from "../../systems/embeds/index.js";

export default {
    category: "embeds",
    permission: PermissionFlagsBits.ManageMessages,

    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Open the Nocthera embed management panel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(client, interaction) {
        return embeds.handler.dashboard(interaction);
    }
};
