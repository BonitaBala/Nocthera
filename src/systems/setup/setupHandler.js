import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    UserSelectMenuBuilder,
    MessageFlags
} from "discord.js";
import setup from "./index.js";

const admin = interaction =>
    interaction.memberPermissions?.has("Administrator") ||
    interaction.memberPermissions?.has("ManageGuild");

const panel = (config) => {
    const securityOn = Object.values(config.security).filter(Boolean).length;
    const monitoring = config.monitoring.enabled ? "🟢 On" : "🔴 Off";
    const ownerText = config.coOwners.length ? config.coOwners.map(id => `<@${id}>`).join(", ") : "None";
    const embed = {
        color: 0x5865F2,
        title: "🧭 Nocthera Server Setup",
        description: "One-time guided setup for the mandatory server protections, moderation defaults and trusted contacts. Advanced controls remain available from **/security** and **/moderation**.",
        fields: [
            { name: "Security", value: `${securityOn}/5 protections enabled`, inline: true },
            { name: "Moderation", value: config.moderation.enabled ? "🟢 Enabled" : "🔴 Disabled", inline: true },
            { name: "Moderator Activity", value: monitoring, inline: true },
            { name: "Co-Owners / Alert Contacts", value: ownerText, inline: false },
            { name: "Join-to-Create VC", value: config.joinToCreate?.enabled && config.joinToCreate?.creatorChannelId ? `🟢 <#${config.joinToCreate.creatorChannelId}>` : "🔴 Disabled", inline: false },
            { name: "Setup", value: config.quickSecureApplied ? "✅ Quick Secure applied" : "⚠️ Initial setup not completed", inline: false }
        ],
        footer: { text: "Nocthera • Guided server setup" }
    };
    const buttons = [
        ["setup:quick", "Quick Secure", "🛡️", ButtonStyle.Success],
        ["setup:protections", "Protections", "🔐", ButtonStyle.Primary],
        ["setup:owners", "Co-Owners", "👑", ButtonStyle.Secondary],
        ["setup:monitoring", "Moderator Alerts", "🚨", ButtonStyle.Secondary],
        ["setup:channel", "Alert Channel", "📢", ButtonStyle.Secondary],
        ["setup:jtc", "Join-to-Create", "🔊", ButtonStyle.Secondary],
        ["setup:status", "Status", "📋", ButtonStyle.Secondary],
        ["setup:reset", "Reset", "♻️", ButtonStyle.Danger]
    ];
    const rows = [];
    for (let i = 0; i < buttons.length; i += 5) {
        rows.push(new ActionRowBuilder().addComponents(
            buttons.slice(i, i + 5).map(([id, label, emoji, style]) => new ButtonBuilder().setCustomId(id).setLabel(label).setEmoji(emoji).setStyle(style))
        ));
    }
    return { embeds: [embed], components: rows };
};

class SetupHandler {
    async dashboard(interaction) {
        if (!interaction || interaction.replied || interaction.deferred) {
            return false;
        }

        if (!admin(interaction)) {
            return interaction.reply({
                content: "❌ Administrator or Manage Server permission required.",
                flags: MessageFlags.Ephemeral
            });
        }

        const config = await setup.get(interaction.guildId);

        if (interaction.replied || interaction.deferred) {
            return false;
        }

        return interaction.reply({
            ...panel(config),
            flags: MessageFlags.Ephemeral
        });
    }

    async handle(interaction) {
        if (!interaction?.customId?.startsWith("setup:")) return false;
        if (!admin(interaction)) {
            await interaction.reply({ content: "❌ Administrator or Manage Server permission required.", flags: MessageFlags.Ephemeral });
            return true;
        }
        const action = interaction.customId.split(":")[1];
        if (interaction.isButton()) {
            if (action === "quick") {
                const config = await setup.quickSecure(interaction.guildId);
                return interaction.update(panel(config));
            }
            if (action === "protections") return this.protections(interaction);
            if (action === "protection") {
                const key = interaction.customId.split(":")[2];
                const config = await setup.toggleProtection(interaction.guildId, key);
                return interaction.update(panel(config));
            }
            if (action === "owners") return this.owners(interaction);
            if (action === "removeowner") {
                const modal = new ModalBuilder().setCustomId("setup:removeowner").setTitle("Remove Co-Owner");
                modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("userId").setLabel("Discord User ID").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(25)));
                return interaction.showModal(modal);
            }
            if (action === "monitoring") return this.monitoring(interaction);
            if (action === "channel") return this.channel(interaction);
            if (action === "jtc") return this.joinToCreate(interaction);
            if (action === "jtcdisable") {
                const config = await setup.disableJoinToCreate(interaction.guildId);
                return interaction.update(panel(config));
            }
            if (action === "status") {
                const config = await setup.get(interaction.guildId);
                return interaction.reply({ content: `\`\`\`json\n${JSON.stringify(config, null, 2).slice(0, 1850)}\n\`\`\``, flags: MessageFlags.Ephemeral });
            }
            if (action === "reset") {
                const config = await setup.reset(interaction.guildId);
                return interaction.update(panel(config));
            }
        }
        if (interaction.isStringSelectMenu() && action === "protection") {
            const key = interaction.values[0];
            const config = await setup.toggleProtection(interaction.guildId, key);
            return interaction.update(panel(config));
        }
        if (interaction.isUserSelectMenu() && action === "addowner") {
            const userId = interaction.values[0];
            if (userId === interaction.guild.ownerId) {
                return interaction.reply({ content: "ℹ️ The server owner is already the primary owner contact.", flags: MessageFlags.Ephemeral });
            }
            const config = await setup.addCoOwner(interaction.guildId, userId);
            return interaction.update(panel(config));
        }
        if (interaction.isModalSubmit()) {
            if (action === "removeowner") {
                const userId = interaction.fields.getTextInputValue("userId").trim();
                const config = await setup.removeCoOwner(interaction.guildId, userId);
                return interaction.reply({ ...panel(config), flags: MessageFlags.Ephemeral });
            }
            if (action === "monitoring") {
                const threshold = Math.max(1, Number(interaction.fields.getTextInputValue("threshold")) || 8);
                const windowMinutes = Math.max(1, Number(interaction.fields.getTextInputValue("window")) || 10);
                const config = await setup.setMonitoring(interaction.guildId, { enabled: true, actionThreshold: threshold, windowMinutes });
                return interaction.reply({ ...panel(config), flags: MessageFlags.Ephemeral });
            }
        }
        if (interaction.isChannelSelectMenu() && action === "logchannel") {
            const channelId = interaction.values[0];
            const config = await setup.config.set(interaction.guildId, { logChannelId: channelId });
            return interaction.update(panel(config));
        }
        if (interaction.isChannelSelectMenu() && action === "jtcchannel") {
            const channelId = interaction.values[0];
            const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
            if (!channel || channel.type !== ChannelType.GuildVoice) {
                return interaction.reply({ content: "❌ Please select a voice channel.", flags: MessageFlags.Ephemeral });
            }
            const config = await setup.setJoinToCreate(interaction.guildId, { enabled: true, creatorChannelId: channel.id, categoryId: channel.parentId ?? null });
            return interaction.update(panel(config));
        }
        return false;
    }

    async protections(interaction) {
        const config = await setup.get(interaction.guildId);
        const labels = [
            ["antiRaid", "Anti-Raid"],
            ["antiSpam", "Anti-Spam"],
            ["antiBot", "Anti-Bot"],
            ["antiNuke", "Anti-Nuke"],
            ["logging", "Security Logging"]
        ];
        const row = new ActionRowBuilder().addComponents(
            labels.map(([key, label]) => new ButtonBuilder().setCustomId(`setup:protection:${key}`).setLabel(`${label}: ${config.security[key] ? "ON" : "OFF"}`).setStyle(config.security[key] ? ButtonStyle.Success : ButtonStyle.Secondary))
        );
        return interaction.reply({ content: "🛡️ Mandatory security protections. Green means enabled.", components: [row], flags: MessageFlags.Ephemeral });
    }

    async owners(interaction) {
        const config = await setup.get(interaction.guildId);
        const add = new ActionRowBuilder().addComponents(new UserSelectMenuBuilder().setCustomId("setup:addowner").setPlaceholder("Select a co-owner / trusted alert contact").setMinValues(1).setMaxValues(1));
        const remove = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:removeowner").setLabel("Remove Co-Owner").setEmoji("➖").setStyle(ButtonStyle.Danger));
        return interaction.reply({ content: `👑 **Owner contacts**\nPrimary owner: <@${interaction.guild.ownerId}>\nCo-owners: ${config.coOwners.length ? config.coOwners.map(id => `<@${id}>`).join(", ") : "None"}`, components: [add, remove], flags: MessageFlags.Ephemeral });
    }

    async monitoring(interaction) {
        const config = await setup.get(interaction.guildId);
        const modal = new ModalBuilder().setCustomId("setup:monitoring").setTitle("Moderator Activity Alerts");
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("threshold").setLabel("Actions before alert").setStyle(TextInputStyle.Short).setValue(String(config.monitoring.actionThreshold)).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("window").setLabel("Window in minutes").setStyle(TextInputStyle.Short).setValue(String(config.monitoring.windowMinutes)).setRequired(true))
        );
        return interaction.showModal(modal);
    }

    async channel(interaction) {
        const row = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("setup:logchannel").setPlaceholder("Select a security/moderation alert channel").setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setMinValues(1).setMaxValues(1));
        return interaction.reply({ content: "📢 Select where Nocthera should post setup/security alert summaries.", components: [row], flags: MessageFlags.Ephemeral });
    }

    async joinToCreate(interaction) {
        const config = await setup.get(interaction.guildId);
        const row = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("setup:jtcchannel").setPlaceholder("Select the voice channel members join to create their own VC").setChannelTypes(ChannelType.GuildVoice).setMinValues(1).setMaxValues(1));
        const components = [row];
        if (config.joinToCreate?.enabled) {
            components.push(new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("setup:jtcdisable").setLabel("Disable Join-to-Create").setEmoji("⛔").setStyle(ButtonStyle.Danger)));
        }
        return interaction.reply({ content: `🔊 **Join-to-Create Voice**\nCurrent creator channel: ${config.joinToCreate?.creatorChannelId ? `<#${config.joinToCreate.creatorChannelId}>` : "Not configured"}\nMembers who join the selected channel will be moved into a private personal voice channel. It is deleted automatically when empty.`, components, flags: MessageFlags.Ephemeral });
    }
}

export default new SetupHandler();
