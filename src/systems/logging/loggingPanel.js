/**
 * ============================================================
 * Nocthera v1.1.0
 * Logging Panel
 * ============================================================
 */

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

class LoggingPanel {

    /**
     * ========================================================
     * Create Logging Panel
     * ========================================================
     */

    create() {

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle("Logging Configuration")

            .setDescription(

                [
                    "Configure the server logging system.",
                    "",
                    "Choose which category you want to configure."
                ].join("\n")

            )

            .setFooter({

                text: "Nocthera Logging"

            })

            .setTimestamp();

        const row = new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId("logging:moderation")

                    .setLabel("Moderation")

                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()

                    .setCustomId("logging:security")

                    .setLabel("Security")

                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()

                    .setCustomId("logging:members")

                    .setLabel("Members")

                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()

                    .setCustomId("logging:messages")

                    .setLabel("Messages")

                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()

                    .setCustomId("logging:server")

                    .setLabel("Server")

                    .setStyle(ButtonStyle.Primary)

            );

        return {

            embeds: [embed],

            components: [row]

        };

    }

}

export default new LoggingPanel();