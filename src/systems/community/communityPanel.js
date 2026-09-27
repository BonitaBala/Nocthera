/**
 * ============================================================
 * Nocthera v1.1.0
 * Community Panel
 * ============================================================
 */

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

class CommunityPanel {

    createMainPanel() {

        const embed = new EmbedBuilder()

            .setTitle("🌙 Community System")

            .setDescription(
                "Manage Nocthera's community features."
            );

        const row = new ActionRowBuilder().addComponents(

            new ButtonBuilder()

                .setCustomId("community_welcome")

                .setLabel("Welcome")

                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()

                .setCustomId("community_autorole")

                .setLabel("Auto Role")

                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()

                .setCustomId("community_counter")

                .setLabel("Member Counter")

                .setStyle(ButtonStyle.Secondary)

        );

        return {

            embeds: [embed],

            components: [row]

        };

    }

    createAnnouncementPanel() {

        const embed = new EmbedBuilder()

            .setTitle("📢 Announcements")

            .setDescription(
                "Configure the community announcement system."
            );

        return {

            embeds: [embed]

        };

    }

    createWelcomePanel() {

        const embed = new EmbedBuilder()

            .setTitle("👋 Welcome System")

            .setDescription(
                "Configure welcome messages and automatic roles."
            );

        return {

            embeds: [embed]

        };

    }

}

export default new CommunityPanel();