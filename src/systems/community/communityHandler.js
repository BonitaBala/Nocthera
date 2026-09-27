import { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags, RoleSelectMenuBuilder } from "discord.js";
import communityManager from "./communityManager.js";

const admin = i => i.memberPermissions?.has("ManageGuild") || i.memberPermissions?.has("Administrator");
const reply = (i, content) => i.reply({ content, flags: MessageFlags.Ephemeral });

class CommunityHandler {
    async handleInteraction(i) {
        if (!i?.customId?.startsWith("community:")) return false;
        if (!admin(i)) { await reply(i, "❌ Manage Server permission required."); return true; }
        const [_, action, extra] = i.customId.split(":");
        const config = communityManager.getConfig(i.guildId);
        if (i.isButton()) {
            if (action === "toggle") config.enabled = !config.enabled;
            else if (action === "welcome") return this.showWelcome(i);
            else if (action === "autorole") return this.showAutoRole(i);
            else if (action === "counter") return this.showCounter(i);
            else if (action === "announce") return this.showAnnounce(i);
            else if (action === "status") return reply(i, `\`\`\`json\n${JSON.stringify(config, null, 2).slice(0, 1800)}\n\`\`\``);
            else if (action === "reset") return this.reset(i);
            communityManager.setConfig(i.guildId, config);
            return reply(i, `✅ Community ${action === "toggle" ? (config.enabled ? "enabled" : "disabled") : "updated"}.`);
        }
        if (i.isChannelSelectMenu()) {
            if (action !== "channel") return false;
            if (extra === "welcome") config.welcome.channelId = i.values[0];
            if (extra === "goodbye") config.goodbye.channelId = i.values[0];
            if (extra === "counter") config.memberCounter.channelId = i.values[0];
            if (extra === "announce") config.announcements.channelId = i.values[0];
            communityManager.setConfig(i.guildId, config);
            await i.update({ content: `✅ ${extra} channel set to <#${i.values[0]}>.`, components: [] });
            return true;
        }
        if (i.isRoleSelectMenu() && action === "autorole") {
            config.autoRole.roleId = i.values[0];
            config.autoRole.enabled = true;
            communityManager.setConfig(i.guildId, config);
            await i.update({ content: `✅ Auto Role set to <@&${i.values[0]}>.`, components: [] });
            return true;
        }
        if (i.isModalSubmit()) {
            if (action === "welcome-modal") { config.welcome.message = i.fields.getTextInputValue("message"); config.welcome.enabled = true; communityManager.setConfig(i.guildId, config); return reply(i, "✅ Welcome message updated and enabled."); }
            if (action === "announce-modal") { await communityManager.announce(i.guildId, i.fields.getTextInputValue("message")); return reply(i, "📢 Announcement sent."); }
        }
        return false;
    }
    async showWelcome(i) {
        const menu = new ChannelSelectMenuBuilder().setCustomId("community:channel:welcome").setPlaceholder("Select welcome channel").setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
        await i.reply({ content: "👋 Select the welcome channel.", components: [new ActionRowBuilder().addComponents(menu)], flags: MessageFlags.Ephemeral });
        return true;
    }
    async showAutoRole(i) {
        const menu = new RoleSelectMenuBuilder().setCustomId("community:autorole:role").setPlaceholder("Select the automatic role");
        await i.reply({ content: "🎭 Select the role members should receive automatically.", components: [new ActionRowBuilder().addComponents(menu)], flags: MessageFlags.Ephemeral });
        return true;
    }
    async showCounter(i) {
        const menu = new ChannelSelectMenuBuilder().setCustomId("community:channel:counter").setPlaceholder("Select counter channel").setChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice);
        await i.reply({ content: "📊 Select the member counter channel.", components: [new ActionRowBuilder().addComponents(menu)], flags: MessageFlags.Ephemeral });
        return true;
    }
    async showAnnounce(i) {
        const modal = new ModalBuilder().setCustomId("community:announce-modal").setTitle("Community Announcement");
        modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("message").setLabel("Announcement").setStyle(TextInputStyle.Paragraph).setMaxLength(4000).setRequired(true)));
        await i.showModal(modal); return true;
    }
    async reset(i) { communityManager.setConfig(i.guildId, (await import("./communityConfig.js")).default.create()); return reply(i, "✅ Community configuration reset."); }
}
export default new CommunityHandler();
