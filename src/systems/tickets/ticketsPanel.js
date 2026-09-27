/**
 * ============================================================
 * Nocthera v1.1.0
 * Tickets Panel
 * ============================================================
 */

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

class TicketsPanel {

    /**
     * ========================================================
     * Create Ticket Panel
     * ========================================================
     */

    create() {

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle("Support Tickets")

            .setDescription(

                [
                    "Need help from the staff team?",
                    "",
                    "Press **Create Ticket** below to open a private support ticket."
                ].join("\n")

            )

            .setFooter({

                text: "Nocthera Tickets"

            })

            .setTimestamp();

        const row = new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId("tickets:create")

                    .setLabel("Create Ticket")

                    .setEmoji("🎫")

                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()

                    .setCustomId("tickets:close")

                    .setLabel("Close")

                    .setEmoji("🔒")

                    .setStyle(ButtonStyle.Danger)

            );

        return {

            embeds: [embed],

            components: [row]

        };

    }

}

export default new TicketsPanel();