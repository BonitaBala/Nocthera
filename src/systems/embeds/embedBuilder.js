/**
 * ============================================================
 * Nocthera v1.1.0
 * Interactive Embed Builder
 * ============================================================
 */

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    EmbedBuilder,
    StringSelectMenuBuilder
} from "discord.js";

const SESSION_TTL = 30 * 60 * 1000;
const ROLE_BUTTON_PREFIX = "embed_role:";

const validHttpUrl = value =>
    typeof value === "string" && /^https?:\/\/\S+$/i.test(value);

class EmbedBuilderService {

    constructor() {
        this.builders = new Map();
    }

    create(data = {}, { preview = false } = {}) {
        const embed = new EmbedBuilder();

        const hasContent =
            Boolean(data.title) ||
            Boolean(data.description) ||
            Boolean(data.url) ||
            Boolean(data.author?.name) ||
            Boolean(data.footer?.text) ||
            Boolean(data.thumbnail?.url) ||
            Boolean(data.image?.url) ||
            (Array.isArray(data.fields) && data.fields.some(field => field?.name && field?.value)) ||
            Boolean(data.timestamp);

        if (data.title) embed.setTitle(String(data.title).slice(0, 256));
        if (data.description) embed.setDescription(String(data.description).slice(0, 4096));

        if (validHttpUrl(data.url)) {
            try { embed.setURL(String(data.url).slice(0, 2048)); } catch {}
        }

        if (data.color !== undefined && data.color !== null) {
            try { embed.setColor(data.color); } catch { embed.setColor(0x5865F2); }
        }

        if (data.timestamp) {
            try {
                embed.setTimestamp(
                    data.timestamp === true ? new Date() : new Date(data.timestamp)
                );
            } catch {}
        }

        if (data.author?.name) {
            const author = { name: String(data.author.name).slice(0, 256) };
            if (validHttpUrl(data.author.iconURL)) author.iconURL = String(data.author.iconURL).slice(0, 2048);
            if (validHttpUrl(data.author.url)) author.url = String(data.author.url).slice(0, 2048);
            try { embed.setAuthor(author); } catch {}
        }

        if (data.footer?.text) {
            const footer = { text: String(data.footer.text).slice(0, 2048) };
            if (validHttpUrl(data.footer.iconURL)) footer.iconURL = String(data.footer.iconURL).slice(0, 2048);
            try { embed.setFooter(footer); } catch {}
        }

        if (validHttpUrl(data.thumbnail?.url)) {
            try { embed.setThumbnail(String(data.thumbnail.url).slice(0, 2048)); } catch {}
        }

        if (validHttpUrl(data.image?.url)) {
            try { embed.setImage(String(data.image.url).slice(0, 2048)); } catch {}
        }

        if (Array.isArray(data.fields)) {
            const fields = data.fields
                .filter(field => field?.name && field?.value)
                .slice(0, 25)
                .map(field => ({
                    name: String(field.name).slice(0, 256),
                    value: String(field.value).slice(0, 1024),
                    inline: Boolean(field.inline)
                }));

            if (fields.length) embed.addFields(fields);
        }

        if (!hasContent && preview) {
            embed.setDescription(
                "✨ **Your embed preview will appear here.**\nUse the buttons below to start building your message."
            );
        }

        return embed;
    }

    start(id, userId, guildId) {
        const session = {
            id,
            userId,
            guildId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            data: {
                color: 0x5865F2,
                fields: [],
                components: [],
                timestamp: false
            },
            targetChannelId: null,
            messageId: null,
            editing: false
        };

        this.builders.set(id, session);
        return session;
    }

    update(id, data = {}) {
        const session = this.get(id);
        if (!session) return null;

        session.data = {
            ...session.data,
            ...data
        };

        if (!Array.isArray(session.data.fields)) session.data.fields = [];
        if (!Array.isArray(session.data.components)) session.data.components = [];

        session.updatedAt = Date.now();
        return session;
    }

    get(id) {
        const session = this.builders.get(id) ?? null;
        if (!session) return null;

        if (Date.now() - session.updatedAt > SESSION_TTL) {
            this.builders.delete(id);
            return null;
        }

        return session;
    }

    setTarget(id, channelId) {
        const session = this.get(id);
        if (!session) return null;

        session.targetChannelId = channelId ?? null;
        session.updatedAt = Date.now();
        return session;
    }

    setMessageId(id, messageId) {
        const session = this.get(id);
        if (!session) return null;

        session.messageId = messageId ?? null;
        session.updatedAt = Date.now();
        return session;
    }

    addField(id, field) {
        const session = this.get(id);
        if (!session) return null;

        if (!Array.isArray(session.data.fields)) session.data.fields = [];
        if (session.data.fields.length >= 25) return null;

        session.data.fields.push({
            name: String(field.name).slice(0, 256),
            value: String(field.value).slice(0, 1024),
            inline: Boolean(field.inline)
        });

        session.updatedAt = Date.now();
        return session;
    }

    removeLastField(id) {
        const session = this.get(id);
        if (!session || !session.data.fields?.length) return false;

        session.data.fields.pop();
        session.updatedAt = Date.now();
        return true;
    }

    addComponent(id, component) {
        const session = this.get(id);
        if (!session) return null;

        if (!Array.isArray(session.data.components)) session.data.components = [];
        if (session.data.components.length >= 5) return null;

        const type = component.type === "role" ? "role" : "link";

        if (type === "link" && !validHttpUrl(component.url)) return null;
        if (type === "role" && !/^\d{15,25}$/.test(String(component.roleId ?? ""))) return null;

        session.data.components.push({
            type,
            label: String(component.label).slice(0, 80),
            ...(type === "link"
                ? { url: String(component.url).slice(0, 512) }
                : { roleId: String(component.roleId) }),
            ...(component.emoji ? { emoji: String(component.emoji).slice(0, 100) } : {})
        });

        session.updatedAt = Date.now();
        return session;
    }

    removeLastComponent(id) {
        const session = this.get(id);
        if (!session || !session.data.components?.length) return false;

        session.data.components.pop();
        session.updatedAt = Date.now();
        return true;
    }

    clearContent(id) {
        const session = this.get(id);
        if (!session) return null;

        session.data = {
            color: 0x5865F2,
            fields: [],
            components: [],
            timestamp: false
        };

        session.targetChannelId = null;
        session.updatedAt = Date.now();
        return session;
    }

    build(id, options = {}) {
        const session = this.get(id);
        return session ? this.create(session.data, options) : null;
    }

    getData(id) {
        const session = this.get(id);
        return session ? structuredClone(session.data) : null;
    }

    buildComponents(id) {
        const session = this.get(id);
        if (!session) return [];

        const key = id;

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`embed_content:${key}`).setLabel("Content").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`embed_style:${key}`).setLabel("Style").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`embed_media:${key}`).setLabel("Media").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`embed_fields:${key}`).setLabel("Fields").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`embed_author:${key}`).setLabel("Author").setStyle(ButtonStyle.Secondary)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`embed_footer:${key}`).setLabel("Footer").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`embed_buttons:${key}`).setLabel("Buttons").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`embed_target:${key}`).setLabel("Target").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`embed_load:${key}`).setLabel("Templates").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`embed_clear:${key}`).setLabel("Clear").setStyle(ButtonStyle.Danger)
        );

        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`embed_save:${key}`).setLabel("Save Template").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`embed_send:${key}`).setLabel("Send Embed").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`embed_cancel:${key}`).setLabel("Cancel").setStyle(ButtonStyle.Danger)
        );

        return [row1, row2, row3];
    }

    buildManagementComponents() {
        return [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("embed_manage_create").setLabel("Create").setEmoji("📝").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("embed_manage_edit").setLabel("Edit").setEmoji("✏️").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("embed_manage_delete").setLabel("Delete").setEmoji("🗑️").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("embed_manage_templates").setLabel("Templates").setEmoji("📚").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("embed_manage_saved").setLabel("Saved").setEmoji("💾").setStyle(ButtonStyle.Secondary)
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("embed_manage_help").setLabel("Help").setEmoji("❓").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("embed_manage_close").setLabel("Close").setEmoji("✖️").setStyle(ButtonStyle.Secondary)
            )
        ];
    }

    buildManagementTemplateMenu(names, customId = "embed_manage_template_select") {
        const menu = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder("Choose a professional template")
            .setMinValues(1)
            .setMaxValues(1);

        for (const name of names.slice(0, 25)) {
            menu.addOptions({
                label: name.slice(0, 100),
                value: name.slice(0, 100)
            });
        }

        return new ActionRowBuilder().addComponents(menu);
    }

    buildFieldManagerMenu(id, fields = []) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`embed_field_manage:${id}`)
            .setPlaceholder(fields.length ? "Choose a field to edit" : "Choose an action")
            .setMinValues(1)
            .setMaxValues(1);

        for (let index = 0; index < Math.min(fields.length, 25); index++) {
            const field = fields[index];
            menu.addOptions({
                label: `${index + 1}. ${String(field.name).slice(0, 90)}`,
                description: "Edit this field",
                value: `edit:${index}`,
                emoji: "✏️"
            });
        }

        if (fields.length < 25 && fields.length < 24) {
            menu.addOptions({
                label: "Add Field",
                description: "Create another embed field",
                value: "add",
                emoji: "➕"
            });
        }

        if (fields.length && fields.length < 24) {
            menu.addOptions({
                label: "Remove Last Field",
                description: "Remove the most recently added field",
                value: "remove",
                emoji: "🗑️"
            });
        }

        return new ActionRowBuilder().addComponents(menu);
    }

    buildTargetMenu(id) {
        return new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId(`embed_target_select:${id}`)
                .setPlaceholder("Choose where the embed should be sent")
                .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setMinValues(1)
                .setMaxValues(1)
        );
    }

    buildTemplateMenu(id, names) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`embed_template_select:${id}`)
            .setPlaceholder("Load a template")
            .setMinValues(1)
            .setMaxValues(1);

        for (const name of names.slice(0, 25)) {
            menu.addOptions({
                label: name.slice(0, 100),
                value: name.slice(0, 100)
            });
        }

        return new ActionRowBuilder().addComponents(menu);
    }

    buildButtonTypeMenu(id) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`embed_button_type:${id}`)
            .setPlaceholder("Choose the button type")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                {
                    label: "Link Button",
                    description: "Open a website URL",
                    value: "link",
                    emoji: "🔗"
                },
                {
                    label: "Role Button",
                    description: "Assign or remove a Discord role",
                    value: "role",
                    emoji: "🎭"
                },
                {
                    label: "Remove Last Button",
                    description: "Remove the most recently added button",
                    value: "remove",
                    emoji: "🗑️"
                }
            );

        return new ActionRowBuilder().addComponents(menu);
    }

    buildButtonRows(buttons = []) {
        if (!Array.isArray(buttons) || !buttons.length) return [];

        const rows = [];

        for (let i = 0; i < buttons.length; i += 5) {
            const row = new ActionRowBuilder();

            for (const button of buttons.slice(i, i + 5)) {
                const builder = new ButtonBuilder()
                    .setLabel(String(button.label).slice(0, 80));

                if (button.emoji) {
                    try { builder.setEmoji(button.emoji); } catch {}
                }

                if (button.type === "role") {
                    builder
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`${ROLE_BUTTON_PREFIX}${button.roleId}`);
                } else if (validHttpUrl(button.url)) {
                    builder
                        .setStyle(ButtonStyle.Link)
                        .setURL(button.url);
                } else {
                    continue;
                }

                row.addComponents(builder);
            }

            if (row.components.length) rows.push(row);
        }

        return rows;
    }

    remove(id) {
        return this.builders.delete(id);
    }

    clear() {
        this.builders.clear();
    }
}

export { ROLE_BUTTON_PREFIX };
export default new EmbedBuilderService();
