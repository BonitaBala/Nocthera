import setup from "../setup/index.js";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } from "discord.js";
import moderationManager from "./moderationManager.js";
const admin=i=>i.memberPermissions?.has("ModerateMembers")||i.memberPermissions?.has("Administrator");
class ModerationHandler {
 async handle(i){
  if(!i?.customId?.startsWith("moderation:"))return false;
  if(!admin(i)){await i.reply({content:"❌ Moderate Members permission required.",flags:MessageFlags.Ephemeral});return true;}
  const [,action]=i.customId.split(":"); const c=moderationManager.getConfig(i.guildId);
  if(i.isButton()){
   if(action==="toggle"){c.enabled=!c.enabled;moderationManager.setConfig(i.guildId,c);return i.reply({content:`✅ Moderation ${c.enabled?"enabled":"disabled"}.`,flags:MessageFlags.Ephemeral});}
   if(action==="settings")return this.settings(i,c);
   if(action==="status")return i.reply({content:`\`\`\`json\n${JSON.stringify(c,null,2).slice(0,1800)}\n\`\`\``,flags:MessageFlags.Ephemeral});
   if(["warn","timeout","kick","ban"].includes(action))return this.actionModal(i,action);
  }
  if(i.isModalSubmit() && action==="settings-modal"){c.warnLimit=Math.max(1,Number(i.fields.getTextInputValue("warnLimit"))||3);c.timeoutLimit=Math.max(1,Number(i.fields.getTextInputValue("timeoutLimit"))||5);moderationManager.setConfig(i.guildId,c);return i.reply({content:"✅ Moderation settings updated.",flags:MessageFlags.Ephemeral});}
  if(i.isModalSubmit() && action==="action"){
   const type=i.customId.split(":")[2]; const userId=i.fields.getTextInputValue("user").trim(); const reason=i.fields.getTextInputValue("reason")||`Action by ${i.user.tag}`; const member=await i.guild.members.fetch(userId).catch(()=>null); if(!member)return i.reply({content:"❌ Member not found.",flags:MessageFlags.Ephemeral});
   if(type==="warn")await moderationManager.warn(member,reason); if(type==="timeout")await moderationManager.timeout(member,Number(i.fields.getTextInputValue("minutes"))*60000,reason); if(type==="kick")await moderationManager.kick(member,reason); if(type==="ban")await moderationManager.ban(member,reason,0);
   const activity = await setup.recordModeratorAction(i.guild, i.user.id, type);
   const alertText = activity.alerted ? "\n🚨 Moderation action limit reached. The server owner and configured co-owners were alerted." : "";
   return i.reply({content:`✅ ${type} completed for <@${member.id}>.${alertText}`,flags:MessageFlags.Ephemeral}).catch(()=>{});
  }
  return false;
 }
 async actionModal(i,type){const m=new ModalBuilder().setCustomId(`moderation:action:${type}`).setTitle(`${type[0].toUpperCase()+type.slice(1)} Member`);m.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("user").setLabel("User ID").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(25)),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("reason").setLabel("Reason").setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(512)));if(type==="timeout")m.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("minutes").setLabel("Minutes").setStyle(TextInputStyle.Short).setValue("10").setRequired(true).setMaxLength(5)));await i.showModal(m);return true;}
 async settings(i,c){const m=new ModalBuilder().setCustomId("moderation:settings-modal").setTitle("Moderation Settings");m.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("warnLimit").setLabel("Warn limit").setStyle(TextInputStyle.Short).setValue(String(c.warnLimit)).setRequired(true)),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("timeoutLimit").setLabel("Timeout limit").setStyle(TextInputStyle.Short).setValue(String(c.timeoutLimit)).setRequired(true)));await i.showModal(m);return true;}
}
export default new ModerationHandler();
