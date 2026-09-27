/**
 * ============================================================
 * Nocthera v1.1.0
 * Command Handler
 * ============================================================
 */

import commandManager from "./commandManager.js";

class CommandHandler {

    // ========================================================
    // Chat Input / Context Menu
    // ========================================================

    async handle(interaction) {

        if (!interaction) {

            return false;

        }

        const isChatInput =
            interaction.isChatInputCommand();

        const isUserContext =
            interaction.isUserContextMenuCommand();

        const isMessageContext =
            interaction.isMessageContextMenuCommand();

        if (
            !isChatInput &&
            !isUserContext &&
            !isMessageContext
        ) {

            return false;

        }

        const command =
            commandManager.get(

                interaction.commandName

            );

        if (!command) {

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "❌ This command is not loaded by Nocthera. Restart the bot or redeploy the command list.",
                    flags: 64
                }).catch(() => {});
            }

            return true;

        }

        let result;

        try {

            result = await commandManager.execute(

                command,

                interaction

            );

        } catch (error) {

            console.error(
                `[COMMAND] /${interaction.commandName} failed:`,
                error?.stack ?? error
            );

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `❌ The /${interaction.commandName} command encountered an error. Check the bot console for details.`,
                    flags: 64
                }).catch(() => {});
            } else {
                await interaction.followUp({
                    content: `❌ The /${interaction.commandName} command encountered an error.`,
                    flags: 64
                }).catch(() => {});
            }

            return true;

        }

        // ----------------------------------------------------
        // Cooldown
        // ----------------------------------------------------

        if (
            result?.cooldown &&
            !interaction.replied &&
            !interaction.deferred
        ) {

            const seconds = Math.max(

                1,

                Math.ceil(

                    result.remaining / 1000

                )

            );

            await interaction.reply({

                content:
                    `⏳ Please wait ${seconds}s before using this command again.`,

                flags: 64

            }).catch(() => {});

        }

        return true;

    }

    // ========================================================
    // Autocomplete
    // ========================================================

    async handleAutocomplete(interaction) {

        if (
            !interaction?.isAutocomplete()
        ) {

            return false;

        }

        const command =
            commandManager.get(

                interaction.commandName

            );

        if (
            !command ||
            typeof command.autocomplete !==
            "function"
        ) {

            return false;

        }

        await command.autocomplete(

            interaction.client,

            interaction

        );

        return true;

    }

    // ========================================================
    // Context Menu
    // ========================================================

    async handleContextMenu(interaction) {

        if (!interaction) {

            return false;

        }

        if (
            !interaction.isUserContextMenuCommand() &&
            !interaction.isMessageContextMenuCommand()
        ) {

            return false;

        }

        const command =
            commandManager.get(

                interaction.commandName

            );

        if (!command) {

            return false;

        }

        const result =
            await commandManager.execute(

                command,

                interaction

            );

        // ----------------------------------------------------
        // Cooldown
        // ----------------------------------------------------

        if (
            result?.cooldown &&
            !interaction.replied &&
            !interaction.deferred
        ) {

            const seconds = Math.max(

                1,

                Math.ceil(

                    result.remaining / 1000

                )

            );

            await interaction.reply({

                content:
                    `⏳ Please wait ${seconds}s before using this command again.`,

                flags: 64

            }).catch(() => {});

        }

        return true;

    }

}

export default new CommandHandler();