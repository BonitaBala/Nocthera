import { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, MessageFlags, StringSelectMenuBuilder, PermissionFlagsBits } from "discord.js";
import ticketsManager from "./ticketsManager.js";
import ticketsPanel from "./ticketsPanel.js";
const admin=i=>i.memberPermissions?.has("ManageChannels")||i.memberPermissions?.has("Administrator");
class TicketsHandler {
 async handle(i){
  if(!i?.customId?.startsWith("tickets:"))return false;
  const [,action,key]=i.customId.split(":");
  if(!admin(i) && action!=="create" && action!=="close"){await i.reply({content:"❌ Manage Channels permission required.",flags:MessageFlags.Ephemeral});return true;}
  if(i.isButton()){
   if(action==="create")return this.createTicket(i);
   if(action==="toggle"){const c=ticketsManager.getConfig(i.guildId);c.enabled=!c.enabled;ticketsManager.setConfig(i.guildId,c);return i.reply({content:`✅ Tickets ${c.enabled?"enabled":"disabled"}.`,flags:MessageFlags.Ephemeral});}
   if(action==="deploy")return i.reply({...ticketsPanel.create(),flags:MessageFlags.Ephemeral});
   if(action==="settings")return this.settings(i);
   if(action==="status")return i.reply({content:`\`\`\`json\n${JSON.stringify(ticketsManager.getConfig(i.guildId),null,2).slice(0,1800)}\n\`\`\``,flags:MessageFlags.Ephemeral});
   if(action==="close"){const ok=ticketsManager.closeTicket(i.channel.id);return i.reply({content:ok?"🔒 Ticket closed.":"❌ Not a tracked ticket.",flags:MessageFlags.Ephemeral});}
  }
  if(i.isStringSelectMenu() && action==="setting"){const field=i.values[0];const menu=new ChannelSelectMenuBuilder().setCustomId(`tickets:channel:${field}`).setPlaceholder(`Set ${field} channel`).setChannelTypes(ChannelType.GuildText,ChannelType.GuildCategory);await i.update({content:`🎫 Select the ${field} channel/category.`,components:[new ActionRowBuilder().addComponents(menu)]});return true;}
  if(i.isChannelSelectMenu() && action==="channel"){const c=ticketsManager.getConfig(i.guildId);c[key]=i.values[0];ticketsManager.setConfig(i.guildId,c);await i.update({content:`✅ ${key} set to <#${i.values[0]}>.`,components:[]});return true;}
  return false;
 }
 async createTicket(i){
  const c=ticketsManager.getConfig(i.guildId);
  if(!c.enabled)return i.reply({content:"❌ Ticket system is disabled.",flags:MessageFlags.Ephemeral});
  const existing=ticketsManager.getTicketsByUser(i.user.id);
  if(existing.length>=Number(c.maxTicketsPerUser||1))return i.reply({content:"❌ You already have the maximum number of open tickets.",flags:MessageFlags.Ephemeral});
  const channel=await i.guild.channels.create({name:`ticket-${i.user.username}`.slice(0,90),type:ChannelType.GuildText,parent:c.categoryId||undefined,permissionOverwrites:[{id:i.guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},{id:i.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]}]}).catch(()=>null);
  if(!channel)return i.reply({content:"❌ I couldn't create the ticket channel. Check Manage Channels permission.",flags:MessageFlags.Ephemeral});
  ticketsManager.createTicket(channel.id,{ownerId:i.user.id,guildId:i.guildId});
  await channel.send({content:`🎫 **Support Ticket**\nWelcome <@${i.user.id}>. A staff member will assist you here.`});
  return i.reply({content:`✅ Ticket created: ${channel}`,flags:MessageFlags.Ephemeral});
 }
 async settings(i){const menu=new StringSelectMenuBuilder().setCustomId("tickets:setting").setPlaceholder("Choose a setting").addOptions({label:"Category",value:"categoryId",emoji:"📁"},{label:"Log Channel",value:"logChannelId",emoji:"📝"},{label:"Transcript Channel",value:"transcriptChannelId",emoji:"📜"});await i.reply({content:"🎫 Ticket Settings",components:[new ActionRowBuilder().addComponents(menu)],flags:MessageFlags.Ephemeral});return true;}
}
export default new TicketsHandler();
