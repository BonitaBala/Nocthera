/**
 * ============================================================
 * Nocthera v1.1.0
 * Interaction Create Event
 * ============================================================
 */

import logger from "../core/logger.js";
import permissions from "../core/permissions.js";

import commands from "../commands/index.js";
import community from "../systems/community/index.js";
import embeds from "../systems/embeds/index.js";
import music from "../systems/music/index.js";
import nsfw from "../systems/nsfw/index.js";
import verificationHandler from "../systems/verification/verificationHandler.js";
import rolesHandler from "../systems/roles/rolesHandler.js";
import moderationHandler from "../systems/moderation/moderationHandler.js";
import ticketsHandler from "../systems/tickets/ticketsHandler.js";
import loggingHandler from "../systems/logging/loggingHandler.js";
import securityHandler from "../systems/security/securityHandler.js";
import setupHandler from "../systems/setup/setupHandler.js";
import systemSelfTestHandler from "../core/systemSelfTestHandler.js";
import { handleCompatibleButton } from "../systems/embeds/buttonCompatibility.js";

const activeInteractions = new Set();

export default {

    name: "interactionCreate",

    once: false,

    async execute(client, interaction) {

        if (!interaction?.id) {
            return;
        }

        if (activeInteractions.has(interaction.id)) {
            logger.warn(`Ignored duplicate interaction dispatch: ${interaction.id}`);
            return;
        }

        activeInteractions.add(interaction.id);

        try {

            // =====================================================
            // Autocomplete
            // =====================================================

            if (interaction.isAutocomplete()) {

                const handled =
                    await commands.handleAutocomplete(
                        interaction
                    );

                if (handled) {
                    return;
                }
                if (!interaction.responded) {
                    await interaction.respond([]).catch(() => {});
                }
                return;

            }

            // =====================================================
            // Slash Commands
            // =====================================================

            if (interaction.isChatInputCommand()) {

                const command =
                    commands.manager.get(
                        interaction.commandName
                    );

                if (!command) {

                    logger.warn(
                        `Received unregistered slash command: /${interaction.commandName}`
                    );

                    return interaction.reply({
                        content:
                            "❌ This command is no longer available. Please wait for the bot's commands to refresh and try again.",
                        flags: 64
                    }).catch(() => {});

                }

                // -------------------------------------------------
                // Permission Check
                // -------------------------------------------------

                if (
                    !permissions.hasAccess(
                        interaction.member,
                        interaction.commandName
                    )
                ) {

                    return interaction.reply({

                        content:
                            "❌ You don't have permission to use this command.",

                        flags: 64

                    });

                }

                // -------------------------------------------------
                // Command Handler
                // -------------------------------------------------

                const handled =
                    await commands.handleInteraction(
                        interaction
                    );

                if (handled) {

                    return;

                }

                return;

            }

            // =====================================================
            // Context Menus
            // =====================================================

            if (
                interaction.isUserContextMenuCommand() ||
                interaction.isMessageContextMenuCommand()
            ) {

                const handled =
                    await commands.handleContextMenu(
                        interaction
                    );

                if (handled) {

                    return;

                }

            }

            // =====================================================
            // System Self-Test Buttons
            // =====================================================

            if (interaction.isButton()) {
                const handled = await systemSelfTestHandler.handle(interaction);
                if (handled) return;
            }

            // =====================================================
            // Guided Setup System
            // =====================================================

            if (
                interaction.isButton() ||
                interaction.isModalSubmit() ||
                interaction.isStringSelectMenu() ||
                interaction.isChannelSelectMenu?.() ||
                interaction.isRoleSelectMenu?.() ||
                interaction.isUserSelectMenu?.()
            ) {
                const handled = await setupHandler.handle(interaction);
                if (handled) return;
            }

            // =====================================================
            // Community System
            // =====================================================

            if (interaction.isButton()) {

                const handled =
                    await community.handleInteraction(
                        interaction
                    );

                if (handled) {

                    return;

                }

            }

            // =====================================================
            // Embeds System
            // =====================================================

            if (
                interaction.isButton() ||
                interaction.isModalSubmit() ||
                interaction.isStringSelectMenu() ||
                interaction.isChannelSelectMenu?.()
            ) {

                const handled =
                    await embeds.handleInteraction(
                        interaction
                    );

                if (handled) {

                    return;

                }

            }

            // =====================================================
            // Other System Interaction Handlers
            // =====================================================

            if (
                interaction.isButton() ||
                interaction.isModalSubmit() ||
                interaction.isStringSelectMenu() ||
                interaction.isChannelSelectMenu?.() ||
                interaction.isRoleSelectMenu?.()
            ) {
                const handlers = [
                    community,
                    music,
                    nsfw,
                    loggingHandler,
                    securityHandler
                ];

                for (const handler of handlers) {
                    const method = typeof handler.handleInteraction === "function"
                        ? handler.handleInteraction.bind(handler)
                        : typeof handler.handle === "function"
                            ? handler.handle.bind(handler)
                            : null;
                    if (method && await method(interaction)) return;
                }
            }

            // =====================================================
            // System Interaction Handlers
            // =====================================================

            if (
                interaction.isButton() ||
                interaction.isModalSubmit() ||
                interaction.isStringSelectMenu() ||
                interaction.isChannelSelectMenu?.() ||
                interaction.isRoleSelectMenu?.()
            ) {
                const systemHandlers = [
                    verificationHandler,
                    rolesHandler,
                    moderationHandler,
                    ticketsHandler
                ];

                for (const handler of systemHandlers) {
                    const method = typeof handler.handle === "function"
                        ? handler.handle.bind(handler)
                        : typeof handler.handleInteraction === "function"
                            ? handler.handleInteraction.bind(handler)
                            : null;
                    if (method && await method(interaction)) return;
                }
            }

            // =====================================================
            // Compatible External / Imported Buttons
            // =====================================================
            //
            // Handles common role-button custom IDs locally so
            // Nocthera does not depend on another application
            // being online to process the interaction.

            if (interaction.isButton()) {

                const compatibleHandled =
                    await handleCompatibleButton(interaction);

                if (compatibleHandled) {
                    return;
                }

            }

            // =====================================================
            // Generic Buttons
            // =====================================================

            if (interaction.isButton()) {

                const handler =
                    client.buttons.get(
                        interaction.customId
                    );

                if (!handler) {

                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.reply({
                            content:
                                "❌ This button is not configured for Nocthera. If it was created by another bot/app, its action must be configured in Nocthera first.",
                            flags: 64
                        }).catch(() => {});
                    }

                    return;

                }

                return handler.execute(

                    client,

                    interaction

                );

            }

            // =====================================================
            // Generic Select Menus
            // =====================================================

            if (interaction.isAnySelectMenu?.()) {

                const handler = client.selectMenus.get(interaction.customId);

                if (handler) {
                    return handler.execute(client, interaction);
                }

                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: "❌ This selection is not configured for Nocthera.",
                        flags: 64
                    }).catch(() => {});
                }
                return;

            }

            // =====================================================
            // Generic Modals
            // =====================================================

            if (interaction.isModalSubmit()) {

                const handler =
                    client.modals.get(
                        interaction.customId
                    );

                if (handler) {
                    return handler.execute(client, interaction);
                }

                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: "❌ This form is not configured for Nocthera.",
                        flags: 64
                    }).catch(() => {});
                }
                return;

            }

        } catch (error) {

            logger.error(

                error?.stack ??
                error

            );

            if (
                interaction.deferred ||
                interaction.replied
            ) {

                await interaction.followUp({

                    content:
                        "❌ An unexpected error occurred.",

                    flags: 64

                }).catch(() => {});

            } else {

                await interaction.reply({

                    content:
                        "❌ An unexpected error occurred.",

                    flags: 64

                }).catch(() => {});

            }

        } finally {

            activeInteractions.delete(interaction.id);

        }

    }

};