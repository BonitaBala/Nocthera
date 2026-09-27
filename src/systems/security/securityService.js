import { AuditLogEvent, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import SecurityConfig from "./securityConfig.js";
import SecurityDetector from "./securityDetector.js";
import SecurityProtection from "./securityProtection.js";
import SecurityPunishment from "./securityPunishment.js";
import SecurityRecovery from "./securityRecovery.js";
import SecurityIncident from "./securityIncident.js";
import SecurityAudit from "./securityAudit.js";
import SecurityMonitor from "./securityMonitor.js";
import setupConfig from "../setupConfig.js";
import logging from "../logging/index.js";
import logger from "../../core/logger.js";

const DESTRUCTIVE_ACTIONS=new Set([
  AuditLogEvent.ChannelCreate, AuditLogEvent.ChannelDelete,
  AuditLogEvent.ChannelOverwriteCreate, AuditLogEvent.ChannelOverwriteUpdate, AuditLogEvent.ChannelOverwriteDelete,
  AuditLogEvent.RoleCreate, AuditLogEvent.RoleDelete, AuditLogEvent.RoleUpdate,
  AuditLogEvent.MemberBanAdd, AuditLogEvent.MemberKick, AuditLogEvent.MemberRoleUpdate,
  AuditLogEvent.WebhookCreate, AuditLogEvent.WebhookDelete, AuditLogEvent.WebhookUpdate,
  AuditLogEvent.BotAdd
]);

class SecurityService {
  constructor(client){
    this.client=client; this.config=new SecurityConfig(); this.detector=new SecurityDetector(this.config);
    this.protection=new SecurityProtection(this.config,this.detector); this.punishment=new SecurityPunishment();
    this.recovery=new SecurityRecovery(); this.incident=new SecurityIncident(); this.audit=new SecurityAudit();
    this.monitor=new SecurityMonitor(this.detector,this.protection,this.punishment,this.recovery,this.incident,this.audit);
    this.destructiveActivity=new Map(); this.alertCooldowns=new Map(); this.threatCooldowns=new Map(); this.lockdownTimers=new Map();
  }

  async initialize(){
    await setupConfig.ensureTable();
    for(const guild of this.client?.guilds?.cache?.values?.()??[]) await this.syncGuildConfig(guild.id);
  }
  async syncGuildConfig(guildId){
    const persisted=await setupConfig.get(guildId).catch(()=>null); if(!persisted) return this.config.get(guildId);
    return this.config.update(guildId,{
      antiRaid:{enabled:persisted.security?.antiRaid ?? this.config.get(guildId).antiRaid.enabled},
      antiSpam:{enabled:persisted.security?.antiSpam ?? this.config.get(guildId).antiSpam.enabled},
      antiBot:{enabled:persisted.security?.antiBot ?? this.config.get(guildId).antiBot.enabled,autoKick:true},
      antiNuke:{enabled:persisted.security?.antiNuke ?? this.config.get(guildId).antiNuke.enabled},
      logging:{enabled:persisted.security?.logging ?? true}
    });
  }
  async handle(guildId,userId,event,data={}){
    await this.syncGuildConfig(guildId);
    const detection=this.detector.register(guildId,userId,event);
    if(!detection.suspicious)return detection;
    for(const threat of detection.threats){
      const cfg=this.config.get(guildId);
      const cooldownMs=threat==='SPAM'?Math.max(30000,Number(cfg.antiSpam.timeframe)||5000):threat==='RAID'?Math.max(30000,Number(cfg.antiRaid.timeframe)||10000):0;
      const key=`${guildId}:${userId}:${threat}`; const last=this.threatCooldowns.get(key)??0;
      if(cooldownMs && Date.now()-last<cooldownMs)continue;
      if(cooldownMs)this.threatCooldowns.set(key,Date.now());
      await this.handleDetectedThreat(guildId,userId,threat,data);
    }
    return detection;
  }
  async handleMessage(message){ if(!message?.guild||!message.author||message.author.bot)return {suspicious:false,threats:[]}; return this.handle(message.guild.id,message.author.id,'MESSAGE',{message}); }
  async handleMemberJoin(member){
    if(!member?.guild||!member.user)return null; const guildId=member.guild.id; await this.syncGuildConfig(guildId); const config=this.config.get(guildId);
    this.detector.trackGuildEvent(guildId,'JOIN');
    if(member.user.bot && config.antiBot.enabled && config.antiBot.autoKick){
      const result=await this.enforceBot(member); await this.alertSecurity(member.guild,'BOT',member.id,`A bot account joined. ${result.reason}`);
    }
    if(config.antiRaid.enabled && this.detector.getGuildEvents(guildId,'JOIN',config.antiRaid.timeframe)>=config.antiRaid.threshold){
      const key=`${guildId}:RAID`; const last=this.threatCooldowns.get(key)??0;
      if(Date.now()-last>=Math.max(config.antiRaid.timeframe,30000)){ this.threatCooldowns.set(key,Date.now()); await this.handleDetectedThreat(guildId,member.id,'RAID',{guild:member.guild,member}); }
    }
    return { suspicious: false, threats: [] };
  }
  async handleAuditAction(guild,action,entry=null){
    if(!guild||!DESTRUCTIVE_ACTIONS.has(action))return null; const executorId=entry?.executorId??entry?.executor?.id;
    if(!executorId||executorId===guild.client.user?.id)return null; await this.syncGuildConfig(guild.id); const config=this.config.get(guild.id);
    const persisted=await setupConfig.get(guild.id).catch(()=>null);
    if(executorId===guild.ownerId || (persisted?.coOwners ?? []).includes(executorId)) return null;
    await setupConfig.get(guild.id).then(c=>this.recordModeratorThreshold(guild, executorId, action, c)).catch(error=>logger.warn(`Moderator threshold tracking failed: ${error?.message??error}`));
    const now=Date.now(), key=`${guild.id}:${executorId}`, windowMs=Math.max(3000,Number(config.antiNuke.timeframe)||10000);
    const events=(this.destructiveActivity.get(key)??[]).filter(x=>now-x.at<=windowMs); events.push({at:now,action}); this.destructiveActivity.set(key,events);
    this.audit.log('DESTRUCTIVE_ACTION',guild.id,{userId:executorId,action,count:events.length});
    if(!config.antiNuke.enabled||events.length<Math.max(1,Number(config.antiNuke.threshold)||3)||await this.isTrusted(guild,executorId))return null;
    const threatKey=`${guild.id}:NUKE:${executorId}`, last=this.threatCooldowns.get(threatKey)??0;
    if(now-last<windowMs)return null; this.threatCooldowns.set(threatKey,now);
    return this.handleDetectedThreat(guild.id,executorId,'NUKE',{guild,entry,action,destructiveActions:events});
  }
  async recordModeratorThreshold(guild,userId,action,config){
    if(!config?.monitoring?.enabled || !userId) return {alerted:false,count:0};
    if(userId===guild.ownerId || (config.coOwners??[]).includes(userId) || userId===guild.client.user?.id) return {alerted:false,count:0,ignored:true};
    const now=Date.now(), windowMs=Math.max(1,Number(config.monitoring.windowMinutes)||10)*60_000, key=`${guild.id}:${userId}:moderation`;
    const entries=(this.destructiveActivity.get(key)??[]).filter(x=>now-x.at<=windowMs); entries.push({at:now,action}); this.destructiveActivity.set(key,entries);
    const threshold=Math.max(1,Number(config.monitoring.actionThreshold)||8); if(entries.length<threshold)return {alerted:false,count:entries.length};
    const alertKey=`${key}:alert`, last=this.destructiveActivity.get(alertKey)?.[0]?.at??0; if(now-last<windowMs)return {alerted:false,count:entries.length};
    this.destructiveActivity.set(alertKey,[{at:now}]);
    const contacts=new Set([guild.ownerId,...(config.coOwners??[])]); const content=`🚨 **Nocthera Moderator Activity Alert**\n<@${userId}> performed **${entries.length} moderation actions** within ${config.monitoring.windowMinutes} minutes in **${guild.name}**.\nLatest action: **${action}**.`;
    for(const id of contacts){try{const user=await guild.client.users.fetch(id);await user.send({content});}catch(error){logger.warn(`Moderator alert DM failed for ${id}: ${error?.message??error}`);}}
    logger.security(`Moderator threshold exceeded: ${guild.name}/${userId}/${entries.length}`);
    return {alerted:true,count:entries.length};
  }

  async handleDetectedThreat(guildId,userId,threat,data={}){
    const protection=await this.protection.protect(guildId,userId,threat,data); const incident=this.incident.create(guildId,threat,{userId,protection,data:this.safeData(data)}); const audit=this.audit.log(threat,guildId,{userId,protection,incidentId:incident.id});
    const guild=this.client?.guilds?.cache?.get(guildId)??data.guild??null; let punishment=null, actionResult=null;
    if(guild && ['SPAM','RAID','BOT','NUKE'].includes(threat)) actionResult=await this.executeProtection(guild,userId,threat,protection,data);
    if(protection?.action&&protection.action!=='LOCKDOWN') punishment=await this.punishment.punish(guildId,userId,protection.action,threat).catch(()=>null);
    return {protection,incident,audit,punishment,actionResult};
  }
  async executeProtection(guild,userId,threat,protection,data={}){
    if(!protection?.blocked)return {success:false,reason:'Protection not enabled'}; let result;
    if(threat==='SPAM'){
      const member=await guild.members.fetch(userId).catch(()=>null);
      if(!member) result={success:false,reason:'Member unavailable'};
      else {
        const stripped=await this.stripMemberAccess(member,'Nocthera Anti-Spam protection');
        const timeout=await this.timeoutMember(member,this.config.get(guild.id).antiSpam.timeoutMs,'Nocthera Anti-Spam protection');
        result={success:Boolean(timeout.success),reason:`${timeout.reason} Roles removed: ${stripped.removedRoles}; channel permission overwrites removed: ${stripped.removedOverwrites}.`,timeout,stripped};
      }
    }
    else if(threat==='RAID') result=await this.lockdownGuild(guild,'Nocthera Anti-Raid protection');
    else if(threat==='BOT'){const member=await guild.members.fetch(userId).catch(()=>null); result=member?.user?.bot?await this.kickMember(member,'Nocthera Anti-Bot protection'):{success:false,reason:'Bot member unavailable'};}
    else if(threat==='NUKE') result=await this.enforceNuke(guild,userId,data);
    await this.alertSecurity(guild,threat,userId,this.describeAction(threat,result,data)); return result;
  }
  async enforceBot(member){ if(!member?.kickable)return {success:false,reason:'Bot is not kickable; check Kick Members permission and role hierarchy.'}; const success=await member.kick('Nocthera Anti-Bot protection').then(()=>true).catch(()=>false); return {success,reason:success?'Bot kicked successfully.':'Discord rejected the bot kick.'}; }
  async enforceNuke(guild,executorId,context={}){
    const lockdown=await this.lockdownGuild(guild,'Nocthera Anti-Nuke protection');
    const member=await guild.members.fetch(executorId).catch(()=>null);
    const stripped=member&&!member.user.bot?await this.stripMemberAccess(member,'Nocthera Anti-Nuke protection'):null;
    let banned=false;
    const config=this.config.get(guild.id);
    if(config.antiNuke.banExecutor&&member&&!member.user.bot&&member.bannable) banned=await member.ban({reason:'Nocthera Anti-Nuke protection'}).then(()=>true).catch(()=>false);
    return {success:Boolean(lockdown?.success||banned||stripped?.success),lockdown,punished:banned,stripped,actions:context.destructiveActions?.length??0};
  }

  async stripMemberAccess(member,reason='Nocthera security protection'){
    if(!member?.guild||member.user?.bot)return {success:false,removedRoles:0,removedOverwrites:0,reason:'Target is unavailable or is a bot.'};
    let removedRoles=0, removedOverwrites=0;
    const removableRoles=member.roles.cache.filter(role=>role.id!==member.guild.id&&!role.managed&&role.editable);
    if(removableRoles.size){
      try { await member.roles.remove([...removableRoles.values()],reason); removedRoles=removableRoles.size; }
      catch(error){ logger.warn(`Failed to remove roles from ${member.id}: ${error?.message??error}`); }
    }
    for(const channel of member.guild.channels.cache.values()){
      const overwrite=channel.permissionOverwrites?.cache?.get?.(member.id);
      if(!overwrite||!channel.manageable)continue;
      try { await overwrite.delete(reason); removedOverwrites++; }
      catch(error){ logger.warn(`Failed to remove permission overwrite ${channel.id}/${member.id}: ${error?.message??error}`); }
    }
    return {success:removedRoles>0||removedOverwrites>0,removedRoles,removedOverwrites,reason};
  }
  async lockdownGuild(guild,reason='Security lockdown'){
    const me=guild.members.me??await guild.members.fetchMe().catch(()=>null); if(!me?.permissions.has(PermissionFlagsBits.ManageChannels))return {success:false,reason:'Nocthera lacks Manage Channels permission.'};
    if(this.recovery.isLocked(guild.id))return {success:true,alreadyLocked:true,changed:0};
    const everyone=guild.roles.everyone, changed=[];
    for(const channel of guild.channels.cache.values()){
      if(!channel?.permissionOverwrites?.edit||channel.isThread?.())continue;
      try{
        const current=channel.permissionOverwrites.cache.get(everyone.id); const send=current?.deny?.has(PermissionFlagsBits.SendMessages)?'deny':current?.allow?.has(PermissionFlagsBits.SendMessages)?'allow':'neutral'; const react=current?.deny?.has(PermissionFlagsBits.AddReactions)?'deny':current?.allow?.has(PermissionFlagsBits.AddReactions)?'allow':'neutral';
        await channel.permissionOverwrites.edit(everyone,{SendMessages:false,AddReactions:false},{reason}); changed.push({channelId:channel.id,send,react});
      }catch(error){ logger.warn(`Lockdown could not update channel ${channel.id}: ${error?.message??error}`); }
    }
    this.recovery.saveLockdown(guild.id,{reason,channels:changed}); clearTimeout(this.lockdownTimers.get(guild.id)); this.lockdownTimers.set(guild.id,setTimeout(()=>this.unlockGuild(guild).catch(()=>{}),15*60_000));
    return {success:changed.length>0,changed:changed.length,reason:changed.length?'Lockdown applied.':'No editable channels were available.'};
  }
  async unlockGuild(guild){ const state=this.recovery.lockdowns.get(guild.id); if(!state)return false; const everyone=guild.roles.everyone; for(const item of state.channels??[]){const ch=guild.channels.cache.get(item.channelId); if(!ch?.permissionOverwrites?.edit)continue; try{await ch.permissionOverwrites.edit(everyone,{SendMessages:item.send==='allow'?true:item.send==='deny'?false:null,AddReactions:item.react==='allow'?true:item.react==='deny'?false:null},{reason:'Nocthera security lockdown recovery'});}catch{}} clearTimeout(this.lockdownTimers.get(guild.id)); this.lockdownTimers.delete(guild.id); this.recovery.cancelLockdown(guild.id); return true; }
  async timeoutMember(member,duration,reason){ if(!member.moderatable)return {success:false,reason:'Member is not timeoutable; check Moderate Members permission and role hierarchy.'}; return member.timeout(duration,reason).then(()=>({success:true,reason:'Member timed out.'})).catch(e=>({success:false,reason:e?.message??'Timeout failed.'})); }
  async kickMember(member,reason){ if(!member.kickable)return {success:false,reason:'Member is not kickable; check Kick Members permission and role hierarchy.'}; return member.kick(reason).then(()=>({success:true,reason:'Member kicked.'})).catch(e=>({success:false,reason:e?.message??'Kick failed.'})); }
  async alertSecurity(guild,threat,userId,details){
    const key=`${guild.id}:${threat}`, last=this.alertCooldowns.get(key)??0; if(Date.now()-last<60_000)return false; this.alertCooldowns.set(key,Date.now());
    const config=await setupConfig.get(guild.id).catch(()=>({coOwners:[],logChannelId:null})); const contacts=new Set([guild.ownerId,...(config.coOwners??[])]); const title=`🚨 Nocthera Security Alert — ${threat}`; const description=`${details}\n\nServer: **${guild.name}**\nUser: <@${userId}>`; const embed=new EmbedBuilder().setColor(0xed4245).setTitle(title).setDescription(description).setTimestamp();
    for(const id of contacts){try{const user=await guild.client.users.fetch(id); await user.send({embeds:[embed]});}catch(error){logger.warn(`Security alert DM failed for ${id}: ${error?.message??error}`);}}
    await logging.manager.send(guild,'security',{title,description,color:'#ED4245',footer:'Nocthera Security'}).catch(()=>{});
    logger.security(`${title}: ${guild.name} / ${userId}`); return true;
  }
  async isTrusted(guild,userId){if(userId===guild.ownerId||userId===guild.client.user?.id)return true; const c=await setupConfig.get(guild.id).catch(()=>({coOwners:[]})); return (c.coOwners??[]).includes(userId);}
  describeAction(threat,result,data){if(threat==='BOT')return result?.reason??'Protection attempted.'; if(threat==='SPAM')return result?.reason??'Protection attempted.'; if(threat==='RAID')return result?.success?`Server lockdown enabled (${result.changed??0} channels).`:result?.reason??'Raid lockdown failed.'; if(threat==='NUKE')return `Anti-nuke: lockdown=${Boolean(result?.lockdown?.success)}, rolesRemoved=${result?.stripped?.removedRoles??0}, permissionOverwritesRemoved=${result?.stripped?.removedOverwrites??0}, executorBanned=${Boolean(result?.punished)}, destructiveActions=${data?.destructiveActions?.length??0}.`; return 'Security protection executed.';}
  safeData(data){const out={...data}; delete out.message; delete out.member; delete out.guild; delete out.entry; return out;}
  status(){return this.monitor.status();} health(){return this.monitor.health();}
  reset(){for(const t of this.lockdownTimers.values())clearTimeout(t); this.lockdownTimers.clear(); this.destructiveActivity.clear(); this.alertCooldowns.clear(); this.threatCooldowns.clear(); this.monitor.reset();}
}
export default SecurityService;
