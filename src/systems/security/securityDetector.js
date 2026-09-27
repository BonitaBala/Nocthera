import logger from "../../core/logger.js";

class SecurityDetector {
  constructor(config){ this.config=config; this.events=new Map(); this.users=new Map(); }
  register(guildId,userId,type){
    const key=`${guildId}:${userId}`;
    const list=this.users.get(key) ?? [];
    list.push({type,timestamp:Date.now()});
    this.users.set(key,list);
    return this.analyze(guildId,userId);
  }
  analyze(guildId,userId){
    const config=this.config.get(guildId), now=Date.now(), key=`${guildId}:${userId}`;
    const spamWindow=Math.max(1000,Number(config.antiSpam.timeframe)||5000);
    const recent=(this.users.get(key)??[]).filter(e=>now-e.timestamp<=spamWindow);
    this.users.set(key,recent);
    const threats=[];
    if(config.antiSpam.enabled && recent.filter(e=>e.type==='MESSAGE').length>=Math.max(1,Number(config.antiSpam.maxMessages)||6)) threats.push('SPAM');
    if(config.antiRaid.enabled && this.getGuildEvents(guildId,'JOIN',Number(config.antiRaid.timeframe)||10000)>=Math.max(1,Number(config.antiRaid.threshold)||10)) threats.push('RAID');
    const result={suspicious:threats.length>0,threats:[...new Set(threats)]};
    if(result.suspicious) logger.security(`Security threat detected: ${result.threats.join(', ')}`);
    return result;
  }
  trackGuildEvent(guildId,type){ const key=`${guildId}:${type}`; const list=this.events.get(key)??[]; list.push(Date.now()); this.events.set(key,list); return list.length; }
  getGuildEvents(guildId,type,timeframe=10000){ const key=`${guildId}:${type}`, now=Date.now(), windowMs=Math.max(1000,Number(timeframe)||10000); const recent=(this.events.get(key)??[]).filter(t=>now-t<=windowMs); this.events.set(key,recent); return recent.length; }
  detectBot(member){ return member?.user?.bot ? {bot:true,reason:'BOT_ACCOUNT'} : {bot:false,reason:null}; }
  status(){ return {trackedUsers:this.users.size,guildEventTypes:this.events.size}; }
  clear(){ this.users.clear(); this.events.clear(); }
}
export default SecurityDetector;
