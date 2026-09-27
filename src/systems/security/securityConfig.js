import logger from "../../core/logger.js";

const DEFAULTS = {
  antiRaid: { enabled: true, threshold: 10, timeframe: 10_000, lockdown: true },
  antiSpam: { enabled: true, maxMessages: 6, timeframe: 5_000, timeoutMs: 60_000 },
  antiBot: { enabled: true, autoKick: true },
  antiNuke: { enabled: true, threshold: 3, timeframe: 10_000, protectionLevel: "high", lockdown: true, banExecutor: true },
  logging: { enabled: true, channel: null }
};

const merge = (base, value={}) => {
  const out = structuredClone(base);
  for (const [k,v] of Object.entries(value || {})) {
    if (v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object") out[k] = { ...out[k], ...v };
    else out[k] = v;
  }
  return out;
};

class SecurityConfig {
  constructor(){ this.defaults=structuredClone(DEFAULTS); this.guildConfigs=new Map(); }
  get(guildId){
    if(!this.guildConfigs.has(guildId)) this.guildConfigs.set(guildId, structuredClone(this.defaults));
    return this.guildConfigs.get(guildId);
  }
  update(guildId, changes={}){
    const next=merge(this.get(guildId), changes);
    this.guildConfigs.set(guildId,next);
    logger.security(`Security config updated for ${guildId}`);
    return next;
  }
  replace(guildId, config={}){ const next=merge(this.defaults,config); this.guildConfigs.set(guildId,next); return next; }
  reset(guildId){ return this.replace(guildId,this.defaults); }
  validate(c){
    return Boolean(c && c.antiRaid && typeof c.antiRaid.enabled==='boolean' && Number.isFinite(c.antiRaid.threshold) && Number.isFinite(c.antiRaid.timeframe) &&
      c.antiSpam && typeof c.antiSpam.enabled==='boolean' && Number.isFinite(c.antiSpam.maxMessages) && Number.isFinite(c.antiSpam.timeframe) &&
      c.antiBot && typeof c.antiBot.enabled==='boolean' && c.antiNuke && typeof c.antiNuke.enabled==='boolean' && Number.isFinite(c.antiNuke.threshold) && Number.isFinite(c.antiNuke.timeframe));
  }
  export(guildId){ return JSON.stringify(this.get(guildId),null,2); }
  status(){ return { guilds:this.guildConfigs.size, defaults:structuredClone(this.defaults) }; }
}
export default SecurityConfig;
