/**
 * ============================================================
 * Nocthera v1.1.0
 * Interactive Embed Builder Handler
 * ============================================================
 */

import {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ButtonStyle,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

import embedManager from "./embedManager.js";
import embedBuilder, { ROLE_BUTTON_PREFIX } from "./embedBuilder.js";
import embedTemplates from "./embedTemplates.js";

const PREFIX = "embed_";
const SESSION_RE = /^embed_[^:]+:(.+)$/;

class EmbedHandler {

    async handleInteraction(interaction) {
        if (!interaction) return false;

        if (interaction.isButton()) {
            if (interaction.customId.startsWith(ROLE_BUTTON_PREFIX)) {
                return this.handleRoleButton(interaction);
            }

            return this.handleButton(interaction);
        }

        if (interaction.isModalSubmit()) return this.handleModal(interaction);
        if (interaction.isStringSelectMenu()) return this.handleSelectMenu(interaction);
        if (interaction.isChannelSelectMenu()) return this.handleChannelSelect(interaction);

        return false;
    }

    async renderTemplateForInteraction(interaction, template) {
        const guild = interaction.guild;
        const member = interaction.member;
        const user = interaction.user;

        const variables = {
            server: guild?.name ?? "Server",
            user: member?.displayName ?? user?.globalName ?? user?.username ?? "Member",
            username: user?.username ?? "Member",
            userTag: user?.tag ?? user?.username ?? "Member",
            userMention: user ? `<@${user.id}>` : "Member",
            memberCount: guild?.memberCount ?? "—",
            members: guild?.memberCount ?? "—",
            channels: guild?.channels?.cache?.size ?? "—",
            message: "Your message goes here.",
            action: "Action details go here.",
            moderator: member?.displayName ?? user?.username ?? "Staff",
            status: "Active"
        };

        const replace = value => typeof value === "string"
            ? value.replace(/\{(\w+)\}/g, (_, key) => variables[key] !== undefined ? String(variables[key]) : `{${key}}`)
            : value;

        const walk = value => {
            if (Array.isArray(value)) return value.map(walk);
            if (!value || typeof value !== "object") return replace(value);
            return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, walk(child)]));
        };

        return walk(structuredClone(template));
    }

    async dashboard(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("🌙 Nocthera Embed Manager")
            .setDescription(`Create, edit, delete, and manage professional embeds from one control panel.

**Create** starts the interactive builder. **Edit** loads an existing embed into the builder so you can update it. **Delete** removes an embed message after confirmation.`)
            .addFields(
                { name: "📝 Create", value: "Build an embed with content, styling, media, fields, authors, footers, and buttons.", inline: true },
                { name: "✏️ Edit", value: "Load an existing embed message and update it without creating a duplicate.", inline: true },
                { name: "📚 Templates", value: "Use Nocthera's professional templates or your saved guild templates.", inline: true }
            )
            .setFooter({ text: "Nocthera Embed System" })
            .setTimestamp();

        await interaction.reply({
            content: "🌙 **Embed Management Panel**",
            embeds: [embed],
            components: embedBuilder.buildManagementComponents(),
            flags: 64
        });
        return true;
    }

    async showEditModal(interaction) {
        return this.showModal(interaction, "embed_manage_edit_modal", "manage", "Edit Existing Embed", [
            this.input("embed_manage_message_id", "Message ID", TextInputStyle.Short, "", true, 25)
        ]);
    }

    async showDeleteModal(interaction) {
        return this.showModal(interaction, "embed_manage_delete_modal", "manage", "Delete Embed Message", [
            this.input("embed_manage_message_id", "Message ID", TextInputStyle.Short, "", true, 25),
            this.input("embed_manage_confirm", "Type DELETE to confirm", TextInputStyle.Short, "", true, 6)
        ]);
    }

    async editExisting(interaction) {
        const messageId = this.value(interaction, "embed_manage_message_id");
        if (!/^\d{15,25}$/.test(messageId)) {
            await interaction.reply({ content: "❌ That does not look like a valid Discord message ID.", flags: 64 });
            return true;
        }

        const message = await interaction.channel?.messages.fetch(messageId).catch(() => null);
        const source = message?.embeds?.[0]?.data;
        if (!message || !source) {
            await interaction.reply({ content: "❌ I couldn't find an embed message with that ID in this channel.", flags: 64 });
            return true;
        }

        const seed = {
            title: source.title,
            description: source.description,
            url: source.url,
            color: source.color,
            timestamp: Boolean(source.timestamp),
            author: source.author ? { name: source.author.name, url: source.author.url, iconURL: source.author.iconURL } : undefined,
            footer: source.footer ? { text: source.footer.text, iconURL: source.footer.icon_url ?? source.footer.iconURL } : undefined,
            thumbnail: source.thumbnail?.url ? { url: source.thumbnail.url } : undefined,
            image: source.image?.url ? { url: source.image.url } : undefined,
            fields: Array.isArray(source.fields) ? source.fields.map(field => ({ name: field.name, value: field.value, inline: Boolean(field.inline) })) : [],
            components: []
        };

        for (const row of message.components ?? []) {
            for (const component of row.components ?? []) {
                if (component.type === 2 && component.style === 5 && component.url) {
                    seed.components.push({ type: "link", label: component.label || "Link", url: component.url, emoji: component.emoji?.name || undefined });
                } else if (component.type === 2 && component.customId?.startsWith(ROLE_BUTTON_PREFIX)) {
                    seed.components.push({ type: "role", label: component.label || "Role", roleId: component.customId.slice(ROLE_BUTTON_PREFIX.length), emoji: component.emoji?.name || undefined });
                }
            }
        }

        const id = `${interaction.user.id}-${Date.now().toString(36)}`;
        const session = embedBuilder.start(id, interaction.user.id, interaction.guildId);
        embedBuilder.update(id, seed);
        session.messageId = message.id;
        session.editing = true;
        session.targetChannelId = message.channelId;
        return this.refresh(interaction, id);
    }

    async deleteExisting(interaction) {
        const messageId = this.value(interaction, "embed_manage_message_id");
        const confirmation = this.value(interaction, "embed_manage_confirm");
        if (!/^\d{15,25}$/.test(messageId) || confirmation !== "DELETE") {
            await interaction.reply({ content: "❌ Enter a valid message ID and type `DELETE` exactly to confirm.", flags: 64 });
            return true;
        }

        const message = await interaction.channel?.messages.fetch(messageId).catch(() => null);
        if (!message) {
            await interaction.reply({ content: "❌ I couldn't find that message in this channel.", flags: 64 });
            return true;
        }

        try {
            await message.delete();
            await interaction.reply({ content: "🗑️ Embed message deleted.", flags: 64 });
        } catch (error) {
            console.error("[EMBEDS] Delete failed:", error);
            await interaction.reply({ content: "❌ I couldn't delete that message. Check my permissions.", flags: 64 });
        }
        return true;
    }

    async showManagementTemplates(interaction) {
        const names = embedTemplates.list();
        await interaction.reply({
            content: "📚 **Professional Embed Templates**\nChoose a template to open it directly in the builder.",
            components: names.length ? [embedBuilder.buildManagementTemplateMenu(names)] : [],
            flags: 64
        });
        return true;
    }

    async handleManagementTemplateSelect(interaction) {
        const name = interaction.values?.[0];
        const rawTemplate = embedTemplates.get(name);
        if (!rawTemplate) {
            await interaction.reply({ content: "❌ Template not found.", flags: 64 });
            return true;
        }
        return this.start(interaction, await this.renderTemplateForInteraction(interaction, rawTemplate));
    }

    async showSavedTemplates(interaction) {
        const names = embedManager.listTemplates(interaction.guildId);
        if (!names.length) {
            await interaction.reply({ content: "💾 You don't have any saved embed templates yet.", flags: 64 });
            return true;
        }
        const menu = embedBuilder.buildManagementTemplateMenu(names, "embed_manage_saved_select");
        await interaction.reply({ content: "💾 **Saved Templates**\nChoose one to open it in the builder.", components: [menu], flags: 64 });
        return true;
    }

    async handleSavedTemplateSelect(interaction) {
        const name = interaction.values?.[0];
        const rawTemplate = embedManager.getTemplate(interaction.guildId, name);
        if (!rawTemplate) {
            await interaction.reply({ content: "❌ Saved template not found.", flags: 64 });
            return true;
        }
        return this.start(interaction, await this.renderTemplateForInteraction(interaction, rawTemplate));
    }

    async showManagementHelp(interaction) {
        await interaction.reply({
            content: [
                "🌙 **Nocthera Embed Manager Help**",
                "",
                "**Create** — Opens the full embed builder.",
                "**Edit** — Enter a message ID to load an existing embed into the builder. Sending updates the original message.",
                "**Delete** — Enter a message ID and type `DELETE` to remove it.",
                "**Templates** — Opens professional built-in templates.",
                "**Saved** — Opens templates saved for this server.",
                "",
                "Inside the builder you can edit content, style, media, fields, author, footer, buttons, target channel, templates, and more."
            ].join("\n"),
            flags: 64
        });
        return true;
    }

    async closeDashboard(interaction) {
        await interaction.update({ content: "🌙 Embed Manager closed.", embeds: [], components: [] });
        return true;
    }

    async start(interaction, seed = {}) {
        const id = `${interaction.user.id}-${Date.now().toString(36)}`;
        const session = embedBuilder.start(id, interaction.user.id, interaction.guildId);

        if (seed && Object.keys(seed).length) embedBuilder.update(id, seed);

        const embed = embedBuilder.build(id, { preview: true });

        await interaction.reply({
            content: this.panelText(session),
            embeds: [embed],
            components: embedBuilder.buildComponents(id),
            flags: 64
        });

        return true;
    }

    async handleButton(interaction) {
        if (!interaction.customId.startsWith(PREFIX)) return false;

        if (interaction.customId.startsWith(ROLE_BUTTON_PREFIX)) {
            return this.handleRoleButton(interaction);
        }

        if (interaction.customId === "embed_manage_create") return this.start(interaction);
        if (interaction.customId === "embed_manage_edit") return this.showEditModal(interaction);
        if (interaction.customId === "embed_manage_delete") return this.showDeleteModal(interaction);
        if (interaction.customId === "embed_manage_templates") return this.showManagementTemplates(interaction);
        if (interaction.customId === "embed_manage_saved") return this.showSavedTemplates(interaction);
        if (interaction.customId === "embed_manage_help") return this.showManagementHelp(interaction);
        if (interaction.customId === "embed_manage_close") return this.closeDashboard(interaction);
        if (interaction.customId === "embed_create") return this.start(interaction);
        if (interaction.customId === "embed_templates") return this.templates(interaction);
        if (interaction.customId === "embed_clear") return this.clearLegacy(interaction);

        const match = interaction.customId.match(SESSION_RE);
        if (!match) return false;

        const [, id] = match;
        const session = embedBuilder.get(id);

        if (!session || session.userId !== interaction.user.id) {
            await interaction.reply({
                content: "❌ This embed builder session has expired or belongs to another user.",
                flags: 64
            });
            return true;
        }

        const action = interaction.customId.slice(
            PREFIX.length,
            interaction.customId.indexOf(":")
        );

        switch (action) {
            case "content": return this.showContentModal(interaction, id);
            case "style": return this.showStyleModal(interaction, id);
            case "media": return this.showMediaModal(interaction, id);
            case "fields": return this.showFieldsManager(interaction, id);
            case "author": return this.showAuthorModal(interaction, id);
            case "footer": return this.showFooterModal(interaction, id);
            case "buttons": return this.showButtonTypeMenu(interaction, id);
            case "target": return this.showTarget(interaction, id);
            case "load": return this.showTemplates(interaction, id);
            case "clear": return this.clearSession(interaction, id);
            case "save": return this.showSaveModal(interaction, id);
            case "send": return this.send(interaction, id);
            case "cancel": return this.cancel(interaction, id);
            default: return false;
        }
    }

    async handleModal(interaction) {
        if (!interaction.customId.startsWith(PREFIX)) return false;

        const parts = interaction.customId.split(":");
        const action = parts[0];
        const id = parts[1];

        if (action === "embed_manage_edit_modal") return this.editExisting(interaction);
        if (action === "embed_manage_delete_modal") return this.deleteExisting(interaction);

        if (action === "embed_field_edit_modal") {
            return this.applyFieldEdit(interaction, id, Number(parts[2]));
        }

        const session = embedBuilder.get(id);

        if (!session || session.userId !== interaction.user.id) {
            await interaction.reply({
                content: "❌ This embed builder session has expired.",
                flags: 64
            });
            return true;
        }

        switch (action) {
            case "embed_content_modal": return this.applyContent(interaction, id);
            case "embed_style_modal": return this.applyStyle(interaction, id);
            case "embed_media_modal": return this.applyMedia(interaction, id);
            case "embed_field_modal": return this.applyField(interaction, id);
            case "embed_author_modal": return this.applyAuthor(interaction, id);
            case "embed_footer_modal": return this.applyFooter(interaction, id);
            case "embed_link_button_modal": return this.applyLinkButton(interaction, id);
            case "embed_role_button_modal": return this.applyRoleButton(interaction, id);
            case "embed_save_modal": return this.saveTemplate(interaction, id);
            default: return false;
        }
    }

    async handleSelectMenu(interaction) {
        if (interaction.customId === "embed_manage_template_select") {
            return this.handleManagementTemplateSelect(interaction);
        }

        if (interaction.customId === "embed_manage_saved_select") {
            return this.handleSavedTemplateSelect(interaction);
        }

        if (interaction.customId.startsWith("embed_template_select:")) {
            return this.handleTemplateSelect(interaction);
        }

        if (interaction.customId.startsWith("embed_button_type:")) {
            return this.handleButtonTypeSelect(interaction);
        }

        if (interaction.customId.startsWith("embed_field_manage:")) {
            return this.handleFieldManageSelect(interaction);
        }

        return false;
    }

    async handleTemplateSelect(interaction) {
        const [, id] = interaction.customId.split(":");
        const session = embedBuilder.get(id);

        if (!session || session.userId !== interaction.user.id) {
            await interaction.reply({
                content: "❌ This embed builder session has expired.",
                flags: 64
            });
            return true;
        }

        const name = interaction.values?.[0];

        const rawTemplate =
            embedTemplates.get(name) ??
            embedManager.getTemplate(interaction.guildId, name);

        if (!rawTemplate) {
            await interaction.reply({
                content: "❌ Template not found.",
                flags: 64
            });
            return true;
        }

        const template = await this.renderTemplateForInteraction(interaction, rawTemplate);

        embedBuilder.update(id, {
            ...structuredClone(template),
            fields: template.fields ?? [],
            components: template.components ?? []
        });

        return this.refresh(interaction, id);
    }

    async handleButtonTypeSelect(interaction) {
        const [, id] = interaction.customId.split(":");
        const session = embedBuilder.get(id);

        if (!session || session.userId !== interaction.user.id) {
            await interaction.reply({
                content: "❌ This embed builder session has expired.",
                flags: 64
            });
            return true;
        }

        const type = interaction.values?.[0];

        if (type === "remove") {
            const removed = embedBuilder.removeLastComponent(id);

            if (!removed) {
                await interaction.update({
                    content: "❌ There are no buttons to remove.",
                    components: embedBuilder.buildComponents(id)
                });
                return true;
            }

            return this.refresh(interaction, id);
        }

        if (type === "role") {
            return this.showRoleButtonModal(interaction, id);
        }

        return this.showLinkButtonModal(interaction, id);
    }

    async handleChannelSelect(interaction) {
        if (!interaction.customId.startsWith("embed_target_select:")) return false;

        const [, id] = interaction.customId.split(":");
        const session = embedBuilder.get(id);

        if (!session || session.userId !== interaction.user.id) {
            await interaction.reply({
                content: "❌ This embed builder session has expired.",
                flags: 64
            });
            return true;
        }

        embedBuilder.setTarget(id, interaction.values?.[0] ?? null);
        return this.refresh(interaction, id);
    }

    async showContentModal(interaction, id) {
        const data = embedBuilder.getData(id) ?? {};

        // Discord's Text Input maximum is 4000, not 4096.
        return this.showModal(interaction, "embed_content_modal", id, "Edit Content", [
            this.input("embed_title", "Title", TextInputStyle.Short, data.title ?? "", false, 256),
            this.input("embed_description", "Description", TextInputStyle.Paragraph, data.description ?? "", false, 4000),
            this.input("embed_url", "URL", TextInputStyle.Short, data.url ?? "", false, 2048)
        ]);
    }

    async showStyleModal(interaction, id) {
        const data = embedBuilder.getData(id) ?? {};
        const color =
            typeof data.color === "number"
                ? data.color.toString(16).padStart(6, "0")
                : "5865F2";

        return this.showModal(interaction, "embed_style_modal", id, "Embed Appearance", [
            this.input("embed_color", "Color (hex, e.g. #5865F2)", TextInputStyle.Short, `#${color}`, false, 7),
            this.input("embed_timestamp", "Timestamp? (yes/no)", TextInputStyle.Short, data.timestamp ? "yes" : "no", false, 3)
        ]);
    }

    async showMediaModal(interaction, id) {
        const data = embedBuilder.getData(id) ?? {};

        return this.showModal(interaction, "embed_media_modal", id, "Embed Images", [
            this.input("embed_thumbnail", "Thumbnail URL", TextInputStyle.Short, data.thumbnail?.url ?? "", false, 2048),
            this.input("embed_image", "Image URL", TextInputStyle.Short, data.image?.url ?? "", false, 2048)
        ]);
    }

    async showFieldsManager(interaction, id) {
        const session = embedBuilder.get(id);
        const fields = session?.data?.fields ?? [];

        const menu = embedBuilder.buildFieldManagerMenu(id, fields);

        await interaction.reply({
            content: fields.length
                ? `📋 **Field Manager**\nChoose a field to edit, or add/remove a field. You currently have **${fields.length}/25** fields.`
                : "📋 **Field Manager**\nYou don't have any fields yet. Add your first field below.",
            components: [menu],
            flags: 64
        });

        return true;
    }

    async handleFieldManageSelect(interaction) {
        const [, id] = interaction.customId.split(":");
        const session = embedBuilder.get(id);

        if (!session || session.userId !== interaction.user.id) {
            await interaction.reply({ content: "❌ This embed builder session has expired.", flags: 64 });
            return true;
        }

        const value = interaction.values?.[0];

        if (value === "add") return this.showFieldModal(interaction, id);

        if (value === "remove") {
            const removed = embedBuilder.removeLastField(id);
            if (!removed) {
                await interaction.update({
                    content: "❌ There are no fields to remove.",
                    components: [embedBuilder.buildFieldManagerMenu(id, session.data.fields)]
                });
                return true;
            }
            await interaction.update({
                content: `🗑️ Removed the last field. You now have **${session.data.fields.length}/25** fields.`,
                components: [embedBuilder.buildFieldManagerMenu(id, session.data.fields)]
            });
            return true;
        }

        if (value.startsWith("edit:")) {
            const index = Number(value.slice(5));
            return this.showFieldEditModal(interaction, id, index);
        }

        return false;
    }

    async showFieldEditModal(interaction, id, index) {
        const data = embedBuilder.getData(id) ?? {};
        const field = data.fields?.[index];

        if (!field) {
            await interaction.reply({ content: "❌ That field no longer exists.", flags: 64 });
            return true;
        }

        return this.showModal(interaction, "embed_field_edit_modal", `${id}:${index}`, "Edit Embed Field", [
            this.input("embed_field_name", "Field name", TextInputStyle.Short, field.name ?? "", true, 256),
            this.input("embed_field_value", "Field value", TextInputStyle.Paragraph, field.value ?? "", true, 1024),
            this.input("embed_field_inline", "Inline? (yes/no)", TextInputStyle.Short, field.inline ? "yes" : "no", false, 3)
        ]);
    }

    async showFieldModal(interaction, id) {
        return this.showModal(interaction, "embed_field_modal", id, "Add Embed Field", [
            this.input("embed_field_name", "Field name", TextInputStyle.Short, "", true, 256),
            this.input("embed_field_value", "Field value", TextInputStyle.Paragraph, "", true, 1024),
            this.input("embed_field_inline", "Inline? (yes/no)", TextInputStyle.Short, "no", false, 3)
        ]);
    }

    async showAuthorModal(interaction, id) {
        const data = embedBuilder.getData(id) ?? {};

        return this.showModal(interaction, "embed_author_modal", id, "Embed Author", [
            this.input("embed_author_name", "Author name", TextInputStyle.Short, data.author?.name ?? "", false, 256),
            this.input("embed_author_url", "Author URL", TextInputStyle.Short, data.author?.url ?? "", false, 2048),
            this.input("embed_author_icon", "Author icon URL", TextInputStyle.Short, data.author?.iconURL ?? "", false, 2048)
        ]);
    }

    async showFooterModal(interaction, id) {
        const data = embedBuilder.getData(id) ?? {};

        return this.showModal(interaction, "embed_footer_modal", id, "Embed Footer", [
            this.input("embed_footer_text", "Footer text", TextInputStyle.Short, data.footer?.text ?? "", false, 2048),
            this.input("embed_footer_icon", "Footer icon URL", TextInputStyle.Short, data.footer?.iconURL ?? "", false, 2048)
        ]);
    }

    async showButtonTypeMenu(interaction, id) {
        const session = embedBuilder.get(id);

        await interaction.reply({
            content: `🔘 **Button Builder**\nYou have ${session.data.components?.length ?? 0}/5 buttons. Choose what you want to add.`,
            components: [embedBuilder.buildButtonTypeMenu(id)],
            flags: 64
        });

        return true;
    }

    async showLinkButtonModal(interaction, id) {
        return this.showModal(interaction, "embed_link_button_modal", id, "Add Link Button", [
            this.input("embed_button_label", "Button label", TextInputStyle.Short, "", true, 80),
            this.input("embed_button_url", "Button URL", TextInputStyle.Short, "https://", true, 512),
            this.input("embed_button_emoji", "Emoji (optional)", TextInputStyle.Short, "", false, 100)
        ]);
    }

    async showRoleButtonModal(interaction, id) {
        return this.showModal(interaction, "embed_role_button_modal", id, "Add Role Button", [
            this.input("embed_role_label", "Button label", TextInputStyle.Short, "Verify", true, 80),
            this.input("embed_role_id", "Discord Role ID", TextInputStyle.Short, "", true, 25),
            this.input("embed_role_emoji", "Emoji (optional)", TextInputStyle.Short, "✅", false, 100)
        ]);
    }

    async showSaveModal(interaction, id) {
        return this.showModal(interaction, "embed_save_modal", id, "Save Embed Template", [
            this.input("embed_template_name", "Template name", TextInputStyle.Short, "", true, 100)
        ]);
    }

    async showModal(interaction, action, id, title, inputs) {
        try {
            const modal = new ModalBuilder()
                .setCustomId(`${action}:${id}`)
                .setTitle(title);

            modal.addComponents(
                ...inputs.map(input =>
                    new ActionRowBuilder().addComponents(input)
                )
            );

            await interaction.showModal(modal);
            return true;
        } catch (error) {
            console.error("[EMBEDS] Failed to open modal:", error);

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "❌ I couldn't open that editor. Please try again.",
                    flags: 64
                }).catch(() => {});
            }

            return true;
        }
    }

    input(id, label, style, value, required, maxLength) {
        const input = new TextInputBuilder()
            .setCustomId(id)
            .setLabel(label.slice(0, 45))
            .setStyle(style)
            .setRequired(required)
            .setMinLength(required ? 1 : 0)
            .setMaxLength(Math.min(maxLength, 4000));

        if (value) input.setValue(String(value).slice(0, Math.min(maxLength, 4000)));

        return input;
    }

    async applyContent(interaction, id) {
        const url = this.value(interaction, "embed_url");

        if (url && !/^https?:\/\/\S+$/i.test(url)) {
            await interaction.reply({
                content: "❌ Embed URL must start with `http://` or `https://`.",
                flags: 64
            });
            return true;
        }

        embedBuilder.update(id, {
            title: this.value(interaction, "embed_title") || undefined,
            description: this.value(interaction, "embed_description") || undefined,
            url: url || undefined
        });

        return this.refresh(interaction, id);
    }

    async applyStyle(interaction, id) {
        const raw = this.value(interaction, "embed_color").replace(/^#/, "").trim();
        const color = /^[0-9a-f]{6}$/i.test(raw) ? parseInt(raw, 16) : 0x5865F2;
        const timestamp = /^y(es)?$/i.test(this.value(interaction, "embed_timestamp"));

        embedBuilder.update(id, { color, timestamp });
        return this.refresh(interaction, id);
    }

    async applyMedia(interaction, id) {
        const thumbnail = this.value(interaction, "embed_thumbnail");
        const image = this.value(interaction, "embed_image");

        if (
            (thumbnail && !/^https?:\/\/\S+$/i.test(thumbnail)) ||
            (image && !/^https?:\/\/\S+$/i.test(image))
        ) {
            await interaction.reply({
                content: "❌ Image and thumbnail URLs must start with `http://` or `https://`.",
                flags: 64
            });
            return true;
        }

        embedBuilder.update(id, {
            thumbnail: thumbnail ? { url: thumbnail } : undefined,
            image: image ? { url: image } : undefined
        });

        return this.refresh(interaction, id);
    }

    async applyFieldEdit(interaction, id, index) {
        const data = embedBuilder.getData(id);
        if (!data || !Array.isArray(data.fields) || !data.fields[index]) {
            await interaction.reply({ content: "❌ That field no longer exists.", flags: 64 });
            return true;
        }

        const name = this.value(interaction, "embed_field_name");
        const value = this.value(interaction, "embed_field_value");

        data.fields[index] = {
            name,
            value,
            inline: /^y(es)?$/i.test(this.value(interaction, "embed_field_inline"))
        };

        embedBuilder.update(id, { fields: data.fields });
        return this.refresh(interaction, id);
    }

    async applyField(interaction, id) {
        const ok = embedBuilder.addField(id, {
            name: this.value(interaction, "embed_field_name"),
            value: this.value(interaction, "embed_field_value"),
            inline: /^y(es)?$/i.test(this.value(interaction, "embed_field_inline"))
        });

        if (!ok) {
            await interaction.reply({
                content: "❌ Maximum of 25 fields reached.",
                flags: 64
            });
            return true;
        }

        return this.refresh(interaction, id);
    }

    async applyAuthor(interaction, id) {
        const name = this.value(interaction, "embed_author_name");
        const url = this.value(interaction, "embed_author_url");
        const iconURL = this.value(interaction, "embed_author_icon");

        if (
            (url && !/^https?:\/\/\S+$/i.test(url)) ||
            (iconURL && !/^https?:\/\/\S+$/i.test(iconURL))
        ) {
            await interaction.reply({
                content: "❌ Author URLs must start with `http://` or `https://`.",
                flags: 64
            });
            return true;
        }

        embedBuilder.update(id, {
            author: name
                ? { name, url: url || undefined, iconURL: iconURL || undefined }
                : undefined
        });

        return this.refresh(interaction, id);
    }

    async applyFooter(interaction, id) {
        const text = this.value(interaction, "embed_footer_text");
        const iconURL = this.value(interaction, "embed_footer_icon");

        if (iconURL && !/^https?:\/\/\S+$/i.test(iconURL)) {
            await interaction.reply({
                content: "❌ Footer icon URL must start with `http://` or `https://`.",
                flags: 64
            });
            return true;
        }

        embedBuilder.update(id, {
            footer: text
                ? { text, iconURL: iconURL || undefined }
                : undefined
        });

        return this.refresh(interaction, id);
    }

    async applyLinkButton(interaction, id) {
        const url = this.value(interaction, "embed_button_url");

        if (!/^https?:\/\/\S+$/i.test(url)) {
            await interaction.reply({
                content: "❌ Button URL must start with `http://` or `https://`.",
                flags: 64
            });
            return true;
        }

        const result = embedBuilder.addComponent(id, {
            type: "link",
            label: this.value(interaction, "embed_button_label"),
            url,
            emoji: this.value(interaction, "embed_button_emoji") || undefined
        });

        if (!result) {
            await interaction.reply({
                content: "❌ You can add up to 5 buttons.",
                flags: 64
            });
            return true;
        }

        return this.refresh(interaction, id);
    }

    async applyRoleButton(interaction, id) {
        const roleId = this.value(interaction, "embed_role_id");

        if (!/^\d{15,25}$/.test(roleId)) {
            await interaction.reply({
                content: "❌ That does not look like a valid Discord Role ID.",
                flags: 64
            });
            return true;
        }

        const role = await interaction.guild?.roles.fetch(roleId).catch(() => null);

        if (!role) {
            await interaction.reply({
                content: "❌ I couldn't find that role in this server. Make sure you copied the correct Role ID.",
                flags: 64
            });
            return true;
        }

        const result = embedBuilder.addComponent(id, {
            type: "role",
            label: this.value(interaction, "embed_role_label"),
            roleId,
            emoji: this.value(interaction, "embed_role_emoji") || undefined
        });

        if (!result) {
            await interaction.reply({
                content: "❌ You can add up to 5 buttons.",
                flags: 64
            });
            return true;
        }

        return this.refresh(interaction, id);
    }

    async saveTemplate(interaction, id) {
        const session = embedBuilder.get(id);
        const name = this.value(interaction, "embed_template_name").trim().toLowerCase();

        if (!name) {
            await interaction.reply({
                content: "❌ Template name is required.",
                flags: 64
            });
            return true;
        }

        embedManager.saveTemplate(interaction.guildId, name, session.data);

        await interaction.reply({
            content: `✅ Saved template **${name}**.`,
            flags: 64
        });

        return true;
    }

    async showTarget(interaction, id) {
        const session = embedBuilder.get(id);

        await interaction.reply({
            content: session.targetChannelId
                ? `📢 Current target: <#${session.targetChannelId}>`
                : "📢 No target selected. Choose a channel below.",
            components: [embedBuilder.buildTargetMenu(id)],
            flags: 64
        });

        return true;
    }

    async showTemplates(interaction, id) {
        const names = [
            ...new Set([
                ...embedTemplates.list(),
                ...embedManager.listTemplates(interaction.guildId)
            ])
        ];

        if (!names.length) {
            await interaction.reply({
                content: "❌ No templates available.",
                flags: 64
            });
            return true;
        }

        await interaction.reply({
            content: "📚 Choose a professional template to load into the builder:",
            components: [embedBuilder.buildTemplateMenu(id, names)],
            flags: 64
        });

        return true;
    }

    async clearSession(interaction, id) {
        embedBuilder.clearContent(id);
        return this.refresh(interaction, id);
    }

    async send(interaction, id) {
        const session = embedBuilder.get(id);
        if (!session) return false;

        const channelId = session.targetChannelId ?? interaction.channelId;
        const channel = await interaction.client.channels.fetch(channelId).catch(() => null);

        if (!channel) {
            await interaction.reply({
                content: "❌ I couldn't access the selected channel. Make sure the channel still exists and the bot can view it.",
                flags: 64
            });
            return true;
        }

        if (!channel.isTextBased() || typeof channel.send !== "function") {
            await interaction.reply({
                content: "❌ That channel cannot receive bot messages. Choose a normal text or announcement channel.",
                flags: 64
            });
            return true;
        }

        // Check permissions in the TARGET channel, not the channel where /embed was opened.
        // Discord channel overwrites can remove permissions even when the bot's role has them globally.
        const me = interaction.guild?.members?.me ?? await interaction.guild?.members?.fetchMe().catch(() => null);
        const permissions = me && typeof channel.permissionsFor === "function"
            ? channel.permissionsFor(me)
            : null;

        if (permissions) {
            const missing = [];
            if (!permissions.has(PermissionFlagsBits.ViewChannel)) missing.push("ViewChannel");
            if (!permissions.has(PermissionFlagsBits.SendMessages)) missing.push("SendMessages");
            if (!permissions.has(PermissionFlagsBits.EmbedLinks)) missing.push("EmbedLinks");

            if (missing.length) {
                await interaction.reply({
                    content: `❌ I cannot send embeds to <#${channel.id}>. Missing permission(s) **${missing.join(", ")}** in that channel. Channel permission overwrites can override the bot role.`,
                    flags: 64
                });
                return true;
            }
        }

        const embedData = embedBuilder.getData(id) ?? {};

        const hasContent =
            Boolean(embedData.title) ||
            Boolean(embedData.description) ||
            Boolean(embedData.url) ||
            Boolean(embedData.author?.name) ||
            Boolean(embedData.footer?.text) ||
            Boolean(embedData.thumbnail?.url) ||
            Boolean(embedData.image?.url) ||
            (Array.isArray(embedData.fields) && embedData.fields.some(field => field?.name && field?.value)) ||
            Boolean(embedData.timestamp);

        if (!hasContent) {
            await interaction.reply({
                content: "❌ Add at least a title, description, field, image, thumbnail, author, footer, URL, or timestamp before sending.",
                flags: 64
            });
            return true;
        }

        const payload = {
            embeds: [embedBuilder.build(id)]
        };

        const components = embedBuilder.buildButtonRows(session.data.components);
        if (components.length) payload.components = components;

        try {
            let message;
            if (session.editing && session.messageId) {
                message = await channel.messages.fetch(session.messageId);
                await message.edit(payload);
                await interaction.reply({
                    content: `✅ Embed updated in <#${channel.id}>.`,
                    flags: 64
                });
            } else {
                message = await channel.send(payload);
                embedBuilder.setMessageId(id, message.id);
                await interaction.reply({
                    content: `✅ Embed sent to <#${channel.id}>.`,
                    flags: 64
                });
            }
        } catch (error) {
            console.error("[EMBEDS] Failed to send embed:", {
                channelId: channel.id,
                code: error?.code,
                status: error?.status,
                message: error?.message
            });

            const code = error?.code ? ` (Discord error ${error.code})` : "";
            let reason = "Discord rejected the message.";

            if (error?.code === 50013) {
                reason = "The bot is missing a channel permission or a channel overwrite is denying access.";
            } else if (error?.code === 50035) {
                reason = "The embed or one of its buttons contains invalid data.";
            }

            await interaction.reply({
                content: `❌ I couldn't send the embed to <#${channel.id}>. ${reason}${code}`,
                flags: 64
            });
        }

        return true;
    }

    async handleRoleButton(interaction) {
        const roleId = interaction.customId.slice(ROLE_BUTTON_PREFIX.length);

        if (!interaction.inGuild()) {
            await interaction.reply({
                content: "❌ Role buttons only work inside a server.",
                flags: 64
            });
            return true;
        }

        const role = await interaction.guild.roles.fetch(roleId).catch(() => null);

        if (!role) {
            await interaction.reply({
                content: "❌ The role attached to this button no longer exists.",
                flags: 64
            });
            return true;
        }

        const member = interaction.member;

        if (!member?.roles) {
            await interaction.reply({
                content: "❌ I couldn't access your server roles.",
                flags: 64
            });
            return true;
        }

        if (role.managed) {
            await interaction.reply({
                content: "❌ That is a managed role and cannot be assigned by the bot.",
                flags: 64
            });
            return true;
        }

        const me = interaction.guild.members.me;

        if (!me || role.position >= me.roles.highest.position) {
            await interaction.reply({
                content: "❌ I can't manage that role. Move the bot's highest role above the selected role.",
                flags: 64
            });
            return true;
        }

        try {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                await interaction.reply({
                    content: `➖ Removed <@&${role.id}> from you.`,
                    flags: 64
                });
            } else {
                await member.roles.add(role);
                await interaction.reply({
                    content: `✅ Added <@&${role.id}> to you.`,
                    flags: 64
                });
            }
        } catch (error) {
            console.error("[EMBEDS] Role button failed:", error);

            await interaction.reply({
                content: "❌ I couldn't update your role. Check the bot's Manage Roles permission and role hierarchy.",
                flags: 64
            });
        }

        return true;
    }

    async cancel(interaction, id) {
        embedBuilder.remove(id);

        await interaction.update({
            content: "🗑️ Embed builder closed.",
            embeds: [],
            components: []
        });

        return true;
    }

    async refresh(interaction, id) {
        const session = embedBuilder.get(id);

        if (!session) {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "❌ This embed builder session has expired.",
                    flags: 64
                });
            }
            return true;
        }

        const embed = embedBuilder.build(id, { preview: true });
        const response = {
            content: this.panelText(session),
            embeds: [embed],
            components: embedBuilder.buildComponents(id)
        };

        if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isChannelSelectMenu()) {
            await interaction.update(response);
        } else if (interaction.isModalSubmit()) {
            await interaction.update(response);
        } else if (interaction.deferred || interaction.replied) {
            await interaction.editReply(response);
        } else {
            await interaction.reply({ ...response, flags: 64 });
        }

        return true;
    }

    panelText(session) {
        const fields = session.data.fields?.length ?? 0;
        const buttons = session.data.components?.length ?? 0;
        const target = session.targetChannelId
            ? `<#${session.targetChannelId}>`
            : "Current channel";

        return [
            `🌙 **Nocthera Embed Builder${session.editing ? " • Editing" : ""}**`,
            session.editing
                ? "Edit the loaded embed below. **Update Embed** will save changes to the original message."
                : "Build a professional Discord embed using the controls below. The preview updates after every change.",
            `📢 Target: ${target}  •  📋 Fields: ${fields}/25  •  🔘 Buttons: ${buttons}/5`
        ].join("\n");
    }

    value(interaction, id) {
        return interaction.fields.getTextInputValue(id)?.trim() ?? "";
    }

    async templates(interaction) {
        const names = embedTemplates.list();

        await interaction.reply({
            content: names.length
                ? `📚 Available templates: ${names.join(", ")}`
                : "No templates available.",
            flags: 64
        });

        return true;
    }

    async clearLegacy(interaction) {
        const prefix = `${interaction.user.id}-`;

        for (const id of embedBuilder.builders.keys()) {
            if (id.startsWith(prefix)) embedBuilder.remove(id);
        }

        await interaction.reply({
            content: "🗑️ Embed builder sessions cleared.",
            flags: 64
        });

        return true;
    }
}

export default new EmbedHandler();
