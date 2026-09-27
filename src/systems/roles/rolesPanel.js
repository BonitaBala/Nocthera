/**
 * ============================================================
 * Nocthera v1.1.0
 * Roles Panel
 * ============================================================
 */

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

class RolesPanel {

    /**
     * ========================================================
     * Create Role Panel
     * ========================================================
     */

    create(panel) {

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle(panel.title ?? "Role Selection")

            .setDescription(

                panel.description ??

                "Click the buttons below to receive or remove roles."

            )

            .setFooter({

                text: "Nocthera Roles"

            })

            .setTimestamp();

        const row = new ActionRowBuilder();

        for (const role of panel.roles) {

            const button = new ButtonBuilder()
                .setCustomId(`roles:${panel.id}:${role.id}`)
                .setLabel(String(role.label ?? "Role").slice(0, 80))
                .setStyle(role.style ?? ButtonStyle.Secondary);

            if (role.emoji) {
                button.setEmoji(role.emoji);
            }

            row.addComponents(button);

        }

        return {

            embeds: [embed],

            components: [row]

        };

    }

}

export default new RolesPanel();