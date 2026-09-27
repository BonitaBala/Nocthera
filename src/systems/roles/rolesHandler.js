import { ActionRowBuilder, ModalBuilder, RoleSelectMenuBuilder, TextInputBuilder, TextInputStyle, MessageFlags, ButtonBuilder, ButtonStyle } from "discord.js";
import rolesService from "./rolesService.js";
import rolesPanel from "./rolesPanel.js";
const admin=i=>i.memberPermissions?.has("ManageRoles")||i.memberPermissions?.has("Administrator");
class RolesHandler {
 constructor(){ this.pendingCreates=new Map(); }
 async handle(i){
  if(!i?.customId?.startsWith("roles:")) return false;
  const parts=i.customId.split(":"); const action=parts[1];
  const publicRoleButton = parts.length >= 3 && !["toggle","create","manage","status","reset","toggleRole","createRoles","createModal","delete"].includes(action);
  if(!publicRoleButton && action!=="toggleRole" && !admin(i)){await i.reply({content:"❌ Manage Roles permission required.",flags:MessageFlags.Ephemeral});return true;}
  if(i.isButton()){
   if(action==="toggle") {const c=rolesService.get(i.guildId);c.enabled=!c.enabled;rolesService.set(i.guildId,c);return i.reply({content:`✅ Roles ${c.enabled?"enabled":"disabled"}.`,flags:MessageFlags.Ephemeral});}
   if(action==="create") return this.create(i);
   if(action==="manage") return this.manage(i);
   if(action==="status"){const c=rolesService.get(i.guildId);return i.reply({content:`\`\`\`json\n${JSON.stringify(c,null,2).slice(0,1800)}\n\`\`\``,flags:MessageFlags.Ephemeral});}
   if(action==="reset"){rolesService.set(i.guildId,{enabled:false,panels:[]});return i.reply({content:"✅ Roles configuration reset.",flags:MessageFlags.Ephemeral});}
   if(action==="delete"){const panelId=parts.slice(2).join(":");const panel=rolesService.getPanel(i.guildId,panelId);if(!panel)return i.reply({content:"❌ Role panel not found.",flags:MessageFlags.Ephemeral});rolesService.removePanel(i.guildId,panelId);return i.reply({content:`✅ Deleted **${panel.title}**.`,flags:MessageFlags.Ephemeral});}
   if(publicRoleButton){const result=await rolesService.toggleRole(i.member,parts[2]);return i.reply({content:result==="added"?"✅ Role added.":result==="removed"?"🗑️ Role removed.":"❌ Role unavailable.",flags:MessageFlags.Ephemeral});}
  }
  if(i.isRoleSelectMenu() && action==="createRoles"){const roles=i.values.slice(0,5).map(id=>({id,label:String(i.guild.roles.cache.get(id)?.name??"Role").slice(0,80)})).filter(role=>i.guild.roles.cache.has(role.id));if(!roles.length){await i.reply({content:"❌ No valid roles were selected.",flags:MessageFlags.Ephemeral});return true;}const token=`${i.user.id}-${Date.now()}`.slice(-60);this.pendingCreates.set(token,{guildId:i.guildId,userId:i.user.id,roles,expiresAt:Date.now()+300000});const modal=new ModalBuilder().setCustomId(`roles:createModal:${token}`).setTitle("Role Panel"); modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("title").setLabel("Panel title").setStyle(TextInputStyle.Short).setMaxLength(256).setValue("Role Selection").setRequired(true))); await i.showModal(modal); return true;}
  if(i.isModalSubmit() && action==="createModal"){const token=parts.slice(2).join(":");const pending=this.pendingCreates.get(token);this.pendingCreates.delete(token);if(!pending||pending.guildId!==i.guildId||pending.userId!==i.user.id||pending.expiresAt<Date.now()){return i.reply({content:"❌ This role-panel session expired. Click **Create Panel** and try again.",flags:MessageFlags.Ephemeral});}const title=String(i.fields.getTextInputValue("title")??"Role Selection").trim().slice(0,256)||"Role Selection";const roles=pending.roles.filter(role=>i.guild.roles.cache.has(role.id)).map(role=>({id:role.id,label:String(i.guild.roles.cache.get(role.id)?.name??role.label).slice(0,80)}));if(!roles.length)return i.reply({content:"❌ The selected roles are no longer available.",flags:MessageFlags.Ephemeral});const p={id:`${i.user.id}-${Date.now()}`,title,roles};rolesService.createPanel(i.guildId,p);return i.reply({...rolesPanel.create(p),flags:MessageFlags.Ephemeral});}
  return false;
 }
 async create(i){const menu=new RoleSelectMenuBuilder().setCustomId("roles:createRoles").setPlaceholder("Select roles for the panel").setMinValues(1).setMaxValues(5);await i.reply({content:"🎭 Select up to five roles.",components:[new ActionRowBuilder().addComponents(menu)],flags:MessageFlags.Ephemeral});return true;}
 async manage(i){const c=rolesService.get(i.guildId);if(!c.panels.length)return i.reply({content:"No role panels exist yet.",flags:MessageFlags.Ephemeral});const row=new ActionRowBuilder();for(const p of c.panels.slice(0,5))row.addComponents(new ButtonBuilder().setCustomId(`roles:delete:${p.id}`).setLabel(`Delete ${p.title.slice(0,50)}`).setStyle(ButtonStyle.Danger));await i.reply({content:"📝 Existing panels. Click one to delete.",components:[row],flags:MessageFlags.Ephemeral});return true;}
}
export default new RolesHandler();
