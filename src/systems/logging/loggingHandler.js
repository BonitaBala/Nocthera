import { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, MessageFlags, StringSelectMenuBuilder } from "discord.js";
import loggingManager from "./loggingManager.js";
const admin = i => i.memberPermissions?.has("ManageGuild") || i.memberPermissions?.has("Administrator");
class LoggingHandler {
    async handleInteraction(i) {
        if (!i?.customId?.startsWith("logging:")) return false;
        if (!admin(i)) { await i.reply({content:"❌ Manage Server permission required.",flags:MessageFlags.Ephemeral}); return true; }
        const [, action, key] = i.customId.split(":");
        const config = loggingManager.getConfig(i.guildId);
        if (i.isButton()) {
            if (action === "toggle") { config.enabled = !config.enabled; loggingManager.setConfig(i.guildId, config); return i.reply({content:`✅ Logging ${config.enabled ? "enabled" : "disabled"}.`,flags:MessageFlags.Ephemeral}); }
            if (action === "channels") return this.channels(i);
            if (action === "events") { for (const name of Object.keys(config.events)) config.events[name] = !config.events[name]; loggingManager.setConfig(i.guildId, config); return i.reply({content:"✅ Logging event switches toggled.",flags:MessageFlags.Ephemeral}); }
            if (action === "status") return i.reply({content:`\`\`\`json\n${JSON.stringify(config,null,2).slice(0,1800)}\n\`\`\``,flags:MessageFlags.Ephemeral});
            if (action === "reset") { const fresh = (await import("./loggingConfig.js")).default.create(); loggingManager.setConfig(i.guildId,fresh); return i.reply({content:"✅ Logging configuration reset.",flags:MessageFlags.Ephemeral}); }
        }
        if (i.isStringSelectMenu() && action === "channelCategory") {
            const category = i.values[0];
            const menu = new ChannelSelectMenuBuilder().setCustomId(`logging:channel:${category}`).setPlaceholder(`Set ${category} channel`).setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
            await i.update({ content: `📢 Select the ${category} log channel.`, components: [new ActionRowBuilder().addComponents(menu)] });
            return true;
        }
        if (i.isChannelSelectMenu() && action === "channel") { config.channels[key] = i.values[0]; loggingManager.setConfig(i.guildId,config); await i.update({content:`✅ ${key} log channel set to <#${i.values[0]}>.`,components:[]}); return true; }
        return false;
    }
    async channels(i) {
        const menu = new StringSelectMenuBuilder().setCustomId("logging:channelCategory").setPlaceholder("Choose a logging category").addOptions(
            ...Object.keys(loggingManager.getConfig(i.guildId).channels).map(name => ({ label: name[0].toUpperCase()+name.slice(1), value: name, emoji: "📢" }))
        );
        await i.reply({content:"📝 Choose the category you want to configure.",components:[new ActionRowBuilder().addComponents(menu)],flags:MessageFlags.Ephemeral}); return true;
    }
}
export default new LoggingHandler();
