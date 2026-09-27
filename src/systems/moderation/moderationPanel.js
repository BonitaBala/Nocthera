/**
 * ============================================================
 * Nocthera v1.1.0
 * Moderation Panel
 * ============================================================
 */

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

class ModerationPanel {

    /**
     * ========================================================
     * Create Moderation Panel
     * ========================================================
     */

    create() {

        const embed = new EmbedBuilder()

            .setColor("#ED4245")

            .setTitle("Moderation")

            .setDescription(

                [
                    "Use the buttons below to perform moderation actions.",
                    "",
                    "Only authorized moderators may use this panel."
                ].join("\n")

            )

            .setFooter({

                text: "Nocthera Moderation"

            })

            .setTimestamp();

        const row = new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId("moderation:warn")

                    .setLabel("Warn")

                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()

                    .setCustomId("moderation:timeout")

                    .setLabel("Timeout")

                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()

                    .setCustomId("moderation:kick")

                    .setLabel("Kick")

                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()

                    .setCustomId("moderation:ban")

                    .setLabel("Ban")

                    .setStyle(ButtonStyle.Danger)

            );

        return {

            embeds: [embed],

            components: [row]

        };

    }

}

export default new ModerationPanel();