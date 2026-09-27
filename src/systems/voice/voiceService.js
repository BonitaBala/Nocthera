import { ChannelType, PermissionFlagsBits } from "discord.js";
import setupConfig from "../setupConfig.js";
import setup from "../setup/index.js";
import logger from "../../core/logger.js";

class VoiceService {
    constructor() {
        this.client = null;
        this.initialized = false;
        this.busy = new Set();
    }

    async initialize(client) {
        this.client = client;
        this.initialized = true;
        await this.reconcile();
        return true;
    }

    async reconcile() {
        if (!this.client?.guilds?.cache) return;
        for (const guild of this.client.guilds.cache.values()) {
            const config = await setupConfig.get(guild.id).catch(() => null);
            if (!config?.joinToCreate?.enabled) continue;
            const tracked = config.joinToCreate.createdChannels ?? {};
            for (const channelId of Object.keys(tracked)) {
                const channel = await guild.channels.fetch(channelId).catch(() => null);
                if (!channel || channel.type !== ChannelType.GuildVoice || channel.members.size === 0) {
                    await setup.unregisterCreatedVoice(guild.id, channelId).catch(() => {});
                    if (channel) await channel.delete("Nocthera Join-to-Create cleanup after restart").catch(() => {});
                }
            }
        }
    }

    async handleVoiceStateUpdate(oldState, newState) {
        const guild = newState?.guild ?? oldState?.guild;
        if (!guild?.id) return;
        const guildId = guild.id;
        const config = await setupConfig.get(guildId).catch(() => null);
        if (!config?.joinToCreate?.enabled) return;

        const creatorId = config.joinToCreate.creatorChannelId;
        if (newState.channelId === creatorId && oldState.channelId !== creatorId) {
            await this.createPersonalChannel(newState.member).catch(error => logger.error(error?.stack ?? error));
        }

        if (oldState.channelId && oldState.channelId !== creatorId) {
            await this.cleanupIfEmpty(guild, oldState.channelId).catch(error => logger.error(error?.stack ?? error));
        }
    }

    async createPersonalChannel(member) {
        if (!member?.guild?.id || !member.user) return null;
        const guild = member.guild;
        const config = await setupConfig.get(guild.id);
        const creatorId = config.joinToCreate?.creatorChannelId;
        if (!creatorId || this.busy.has(member.id)) return null;

        const creator = await guild.channels.fetch(creatorId).catch(() => null);
        if (!creator || creator.type !== ChannelType.GuildVoice) return null;
        if (!member.voice?.channel || member.voice.channel.id !== creator.id) return null;
        const me = guild.members.me ?? await guild.members.fetchMe().catch(() => null);
        if (!me?.permissions.has(PermissionFlagsBits.ManageChannels) || !me?.permissions.has(PermissionFlagsBits.MoveMembers)) {
            logger.warn(`Join-to-Create unavailable in ${guild.name}: Nocthera needs Manage Channels and Move Members.`);
            return null;
        }

        this.busy.add(member.id);
        try {
            const existingTracked = Object.entries(config.joinToCreate?.createdChannels ?? {})
                .find(([, ownerId]) => ownerId === member.id);
            if (existingTracked) {
                const existing = await guild.channels.fetch(existingTracked[0]).catch(() => null);
                if (existing?.type === ChannelType.GuildVoice) {
                    await member.voice.setChannel(existing, "Nocthera Join-to-Create").catch(() => {});
                    return existing;
                }
                await setup.unregisterCreatedVoice(guild.id, existingTracked[0]).catch(() => {});
            }

            const channel = await guild.channels.create({
                name: `🔊・${member.displayName.slice(0, 80)}`,
                type: ChannelType.GuildVoice,
                parent: creator.parentId ?? undefined,
                reason: "Nocthera Join-to-Create personal voice channel",
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.Stream, PermissionFlagsBits.UseVAD]
                    }
                ]
            });

            await setup.registerCreatedVoice(guild.id, channel.id, member.id);
            await member.voice.setChannel(channel, "Nocthera Join-to-Create");
            return channel;
        } finally {
            this.busy.delete(member.id);
        }
    }

    async cleanupIfEmpty(guild, channelId) {
        const config = await setupConfig.get(guild.id).catch(() => null);
        const tracked = config?.joinToCreate?.createdChannels ?? {};
        if (!Object.prototype.hasOwnProperty.call(tracked, channelId)) return false;

        const channel = await guild.channels.fetch(channelId).catch(() => null);
        if (!channel) {
            await setup.unregisterCreatedVoice(guild.id, channelId).catch(() => {});
            return false;
        }
        if (channel.type !== ChannelType.GuildVoice || channel.members.size > 0) return false;

        await channel.delete("Nocthera Join-to-Create empty channel cleanup").catch(() => {});
        await setup.unregisterCreatedVoice(guild.id, channelId).catch(() => {});
        return true;
    }
}

export default new VoiceService();
