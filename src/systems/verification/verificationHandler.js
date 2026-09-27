import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    EmbedBuilder,
    MessageFlags,
    ModalBuilder,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";
import verificationManager from "./verificationManager.js";
import verificationPanel from "./verificationPanel.js";
import verificationConfig from "./verificationConfig.js";
import embedBuilder from "../embeds/embedBuilder.js";

const PREFIX = "verification:";
const embedSessions = new Map();
const admin = i => i.memberPermissions?.has("ManageGuild") || i.memberPermissions?.has("Administrator");
const reply = (i, payload) => i.reply({ ...payload, flags: MessageFlags.Ephemeral });

class VerificationHandler {
    async handle(i) {
        if (!i?.customId?.startsWith(PREFIX)) return false;
        if (i.isButton() && i.customId === "verification:verify") return this.verify(i);
        if (!admin(i)) { await reply(i, { content: "❌ Manage Server permission required." }); return true; }
        if (i.isButton()) {
            if (i.customId.startsWith("verification:apply-embed:")) return this.applyEmbed(i);
            return this.button(i);
        }
        if (i.isStringSelectMenu()) return this.select(i);
        if (i.isChannelSelectMenu?.()) return this.channel(i);
        if (i.isRoleSelectMenu?.()) return this.role(i);
        if (i.isModalSubmit()) return this.modal(i);
        return false;
    }

    async verify(i) {
        const result = await verificationManager.verify(i.member);
        if (result.success) return reply(i, { content: "✅ You have been successfully verified." });
        if (result.reason === "captcha_required") {
            const code = verificationManager.createCaptcha(i.guildId, i.user.id);
            const modal = new ModalBuilder().setCustomId("verification:captcha").setTitle("Verification CAPTCHA");
            modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("code").setLabel(`Enter this code: ${code}`).setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(8)));
            await i.showModal(modal);
            return true;
        }
        return reply(i, { content: `❌ ${result.reason}` });
    }

    async dashboard(i) {
        if (!admin(i)) return reply(i, { content: "❌ You need **Manage Server** permission to manage verification." });
        const config = verificationManager.getConfig(i.guildId);
        await reply(i, { content: "🛡️ **Verification Management Panel**", embeds: [this.embed(i.guild, config)], components: this.components(config) });
        return true;
    }

    embed(guild, c) {
        const p = c.protections;
        return new EmbedBuilder().setColor(c.enabled ? 0x57F287 : 0xED4245)
            .setTitle("🛡️ Nocthera Verification")
            .setDescription("Configure verification, protections, roles, channels and the public panel from one place.")
            .addFields(
                { name: "Status", value: c.enabled ? "🟢 Enabled" : "🔴 Disabled", inline: true },
                { name: "Verified Role", value: c.verifiedRole ? `<@&${c.verifiedRole}>` : "Not configured", inline: true },
                { name: "Panel Channel", value: c.panelChannel ? `<#${c.panelChannel}>` : "Not configured", inline: true },
                { name: "Account Age", value: p.accountAge ? `🟢 ${p.minimumAccountAge} days` : "⚪ Off", inline: true },
                { name: "CAPTCHA", value: p.captcha ? "🟢 On" : "⚪ Off", inline: true },
                { name: "Join Grace", value: p.joinGracePeriod ? `🟢 ${p.joinGraceMinutes} min` : "⚪ Off", inline: true }
            ).setFooter({ text: `${guild.name} • Nocthera Verification` }).setTimestamp();
    }

    components(c) {
        return [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("verification:toggle").setLabel(c.enabled ? "Disable" : "Enable").setStyle(c.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
                new ButtonBuilder().setCustomId("verification:settings").setLabel("Settings").setEmoji("⚙️").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("verification:protections").setLabel("Protections").setEmoji("🛡️").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("verification:embed").setLabel("Edit Embed").setEmoji("🎨").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("verification:deploy").setLabel("Deploy / Update").setEmoji("📤").setStyle(ButtonStyle.Success)
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("verification:reset").setLabel("Reset").setEmoji("🗑️").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("verification:status").setLabel("Status").setEmoji("📋").setStyle(ButtonStyle.Secondary)
            )
        ];
    }

    async button(i) {
        const c = verificationManager.getConfig(i.guildId);
        switch (i.customId) {
            case "verification:toggle": c.enabled = !c.enabled; verificationManager.setConfig(i.guildId, c); return i.update({ embeds: [this.embed(i.guild, c)], components: this.components(c) });
            case "verification:settings": return this.settings(i);
            case "verification:protections": return this.protections(i);
            case "verification:embed": return this.startEmbedEditor(i);
            case "verification:deploy": return this.deploy(i);
            case "verification:status": return reply(i, { content: `\`\`\`json\n${JSON.stringify(c, null, 2).slice(0, 1800)}\n\`\`\`` });
            case "verification:reset": { const fresh = verificationManager.reset(i.guildId); return i.update({ embeds: [this.embed(i.guild, fresh)], components: this.components(fresh) }); }
            default: return false;
        }
    }

    async settings(i) {
        const menu = new StringSelectMenuBuilder().setCustomId("verification:settings-select").setPlaceholder("Choose a setting")
            .addOptions(
                { label: "Panel Channel", value: "panelChannel", emoji: "📢" },
                { label: "Verified Role", value: "verifiedRole", emoji: "✅" },
                { label: "Unverified Role", value: "unverifiedRole", emoji: "👤" },
                { label: "Log Channel", value: "logChannel", emoji: "📋" },
                { label: "Button Settings", value: "button", emoji: "🔘" }
            );
        await reply(i, { content: "⚙️ **Verification Settings**", components: [new ActionRowBuilder().addComponents(menu)] }); return true;
    }

    async protections(i) {
        const p = verificationManager.getConfig(i.guildId).protections;
        const menu = new StringSelectMenuBuilder().setCustomId("verification:protection-select").setPlaceholder("Choose a protection")
            .addOptions(
                { label: `Account Age: ${p.accountAge ? "ON" : "OFF"}`, value: "accountAge", emoji: "🕒" },
                { label: `CAPTCHA: ${p.captcha ? "ON" : "OFF"}`, value: "captcha", emoji: "🔐" },
                { label: `Join Grace: ${p.joinGracePeriod ? "ON" : "OFF"}`, value: "joinGrace", emoji: "⏱️" },
                { label: `Remove Unverified: ${p.removeUnverifiedRole ? "ON" : "OFF"}`, value: "removeUnverified", emoji: "🚪" },
                { label: "Edit Protection Values", value: "values", emoji: "✏️" }
            );
        await reply(i, { content: "🛡️ **Protection Settings**", components: [new ActionRowBuilder().addComponents(menu)] }); return true;
    }

    async select(i) {
        const value = i.values?.[0];
        const c = verificationManager.getConfig(i.guildId);
        if (i.customId === "verification:settings-select") {
            if (["panelChannel", "logChannel"].includes(value)) return this.channelPrompt(i, value);
            if (["verifiedRole", "unverifiedRole"].includes(value)) return this.rolePrompt(i, value);
            if (value === "button") return this.buttonModal(i);
        }
        if (i.customId === "verification:protection-select") {
            if (value === "accountAge") c.protections.accountAge = !c.protections.accountAge;
            if (value === "captcha") c.protections.captcha = !c.protections.captcha;
            if (value === "joinGrace") c.protections.joinGracePeriod = !c.protections.joinGracePeriod;
            if (value === "removeUnverified") c.protections.removeUnverifiedRole = !c.protections.removeUnverifiedRole;
            if (value === "values") return this.protectionModal(i);
            verificationManager.setConfig(i.guildId, c);
            await i.update({ content: "✅ Protection updated.", components: [] }); return true;
        }
        return false;
    }

    async channelPrompt(i, field) {
        const menu = new ChannelSelectMenuBuilder().setCustomId(`verification:channel:${field}`).setPlaceholder("Select a text channel").setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
        await reply(i, { content: `📢 Select the ${field === "panelChannel" ? "verification panel" : "log"} channel.`, components: [new ActionRowBuilder().addComponents(menu)] }); return true;
    }
    async rolePrompt(i, field) {
        const menu = new RoleSelectMenuBuilder().setCustomId(`verification:role:${field}`).setPlaceholder("Select a role");
        await reply(i, { content: `🎭 Select the ${field === "verifiedRole" ? "verified" : "unverified"} role.`, components: [new ActionRowBuilder().addComponents(menu)] }); return true;
    }
    async channel(i) { const [, , field] = i.customId.split(":"); const c = verificationManager.getConfig(i.guildId); c[field] = i.values[0]; verificationManager.setConfig(i.guildId,c); await i.update({content:`✅ ${field} set to <#${i.values[0]}>.`,components:[]}); return true; }
    async role(i) { const [, , field] = i.customId.split(":"); const c = verificationManager.getConfig(i.guildId); c[field] = i.values[0]; verificationManager.setConfig(i.guildId,c); await i.update({content:`✅ ${field} set to <@&${i.values[0]}>.`,components:[]}); return true; }

    async buttonModal(i) {
        const c = verificationManager.getConfig(i.guildId); const m = new ModalBuilder().setCustomId("verification:button-modal").setTitle("Verification Button");
        m.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("label").setLabel("Button label").setStyle(TextInputStyle.Short).setValue(c.button.label).setMaxLength(80).setRequired(true)), new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("emoji").setLabel("Emoji").setStyle(TextInputStyle.Short).setValue(c.button.emoji || "✅").setMaxLength(10).setRequired(false)), new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("style").setLabel("Style: primary/secondary/success/danger").setStyle(TextInputStyle.Short).setValue(c.button.style).setMaxLength(12).setRequired(true)));
        await i.showModal(m); return true;
    }
    async protectionModal(i) {
        const p = verificationManager.getConfig(i.guildId).protections; const m = new ModalBuilder().setCustomId("verification:protection-values").setTitle("Protection Values");
        m.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("age").setLabel("Minimum account age (days)").setStyle(TextInputStyle.Short).setValue(String(p.minimumAccountAge)).setRequired(true)), new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("grace").setLabel("Join grace minutes").setStyle(TextInputStyle.Short).setValue(String(p.joinGraceMinutes)).setRequired(true)), new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("captchaLength").setLabel("CAPTCHA length 4-8").setStyle(TextInputStyle.Short).setValue(String(p.captchaLength)).setRequired(true)));
        await i.showModal(m); return true;
    }

    async modal(i) {
        if (i.customId === "verification:captcha") { const ok = verificationManager.consumeCaptcha(i.guildId,i.user.id,i.fields.getTextInputValue("code")); if(!ok)return reply(i,{content:"❌ Incorrect or expired CAPTCHA."}); const result=await verificationManager.verify(i.member); return reply(i,{content:result.success?"✅ You have been successfully verified.":`❌ ${result.reason}`}); }
        const c = verificationManager.getConfig(i.guildId);
        if (i.customId === "verification:button-modal") { const style=i.fields.getTextInputValue("style").toLowerCase(); c.button.label=i.fields.getTextInputValue("label"); c.button.emoji=i.fields.getTextInputValue("emoji")||"✅"; c.button.style=["primary","secondary","success","danger"].includes(style)?style:"success"; verificationManager.setConfig(i.guildId,c); return reply(i,{content:"✅ Verification button updated."}); }
        if (i.customId === "verification:protection-values") { c.protections.minimumAccountAge=Math.max(0,Number(i.fields.getTextInputValue("age"))||0); c.protections.joinGraceMinutes=Math.max(0,Number(i.fields.getTextInputValue("grace"))||0); c.protections.captchaLength=Math.min(8,Math.max(4,Number(i.fields.getTextInputValue("captchaLength"))||6)); verificationManager.setConfig(i.guildId,c); return reply(i,{content:"✅ Protection values updated."}); }
        return false;
    }

    async startEmbedEditor(i) {
        const c = verificationManager.getConfig(i.guildId); const id=`verification-${i.user.id}-${Date.now().toString(36)}`; const session=embedBuilder.start(id,i.user.id,i.guildId); session.verificationMode=true; embedBuilder.update(id,structuredClone(c.embed)); embedSessions.set(id,{guildId:i.guildId,userId:i.user.id});
        await reply(i,{content:"🎨 **Verification Embed Editor**\nEdit the embed with Nocthera's existing builder, then press **Use for Verification**.",embeds:[embedBuilder.build(id,{preview:true})],components:[...embedBuilder.buildComponents(id),new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`verification:apply-embed:${id}`).setLabel("Use for Verification").setStyle(ButtonStyle.Success).setEmoji("✅"))]}); return true;
    }
    async applyEmbed(i) {
        const id=i.customId.slice("verification:apply-embed:".length); const session=embedBuilder.get(id); const owner=embedSessions.get(id); if(!session||!owner||owner.userId!==i.user.id||owner.guildId!==i.guildId)return reply(i,{content:"❌ Embed editor session expired."}); const data=embedBuilder.getData(id); if(!data)return reply(i,{content:"❌ Could not read embed data."}); const c=verificationManager.getConfig(i.guildId); c.embed=structuredClone(data); verificationManager.setConfig(i.guildId,c); embedSessions.delete(id); embedBuilder.clearContent(id); return reply(i,{content:"✅ Verification embed updated."});
    }
    async deploy(i) {
        const c=verificationManager.getConfig(i.guildId); if(!c.panelChannel)return reply(i,{content:"❌ Select a panel channel first."}); if(!c.verifiedRole)return reply(i,{content:"❌ Select a verified role first."}); const channel=await i.client.channels.fetch(c.panelChannel).catch(()=>null); if(!channel?.isTextBased?.())return reply(i,{content:"❌ Panel channel unavailable."});
        const me=i.guild.members.me??await i.guild.members.fetchMe(); const perms=channel.permissionsFor(me); if(perms && (!perms.has("ViewChannel")||!perms.has("SendMessages")||!perms.has("EmbedLinks")))return reply(i,{content:"❌ I need View Channel, Send Messages and Embed Links in the selected channel."});
        const payload=verificationPanel.create(c,i.guild); let message=null; if(c.panelMessage)message=await channel.messages.fetch(c.panelMessage).catch(()=>null); try{if(message)await message.edit(payload);else message=await channel.send(payload);c.panelMessage=message.id;c.enabled=true;verificationManager.setConfig(i.guildId,c);return reply(i,{content:`✅ Verification panel deployed in <#${channel.id}>.`});}catch(error){return reply(i,{content:`❌ Could not deploy panel: ${error?.message??"Unknown error."}`});}
    }
}
export default new VerificationHandler();
