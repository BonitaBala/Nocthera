import logger from "../core/logger.js";
import setupConfig from "../systems/setupConfig.js";
import logging from "../systems/logging/index.js";
import security from "../systems/security/index.js";

const ACTION_NAMES = new Map([
  [10, "Channel Created"],
  [12, "Channel Deleted"],
  [13, "Channel Permission Overwrite Created"],
  [14, "Channel Permission Overwrite Updated"],
  [15, "Channel Permission Overwrite Deleted"],
  [28, "Bot Added"],
  [20, "Member Kicked"],
  [22, "Member Banned"],
  [25, "Member Role Updated"],
  [30, "Role Created"],
  [31, "Role Updated"],
  [32, "Role Deleted"],
  [50, "Webhook Created"],
  [51, "Webhook Updated"],
  [52, "Webhook Deleted"]
]);

export default {
  name: "guildAuditLogEntryCreate",
  once: false,
  async execute(client, entry, guild) {
    if (!guild?.id || !entry?.action) return;

    try {
      const executorId = entry?.executorId ?? entry?.executor?.id;
      if (!executorId) return;

      // Nocthera-generated actions (including Join-to-Create VC lifecycle)
      // are never moderation/server log events.
      if (executorId === client?.user?.id || executorId === guild.client?.user?.id) return;

      // Owner/co-owner actions are trusted and intentionally silent.
      const config = await setupConfig.get(guild.id).catch(() => null);
      if (executorId === guild.ownerId || (config?.coOwners ?? []).includes(executorId)) return;

      const service = (client.modules?.get?.("security") ?? security)?.service;
      const securityResult = service
        ? await service.handleAuditAction(guild, entry.action, entry)
        : null;

      // Security incidents already emit their own single alert embed.
      // Do not create a second generic audit embed for the same action.
      if (securityResult) return;

      const actionName = ACTION_NAMES.get(Number(entry.action)) ?? `Audit action ${entry.action}`;
      const target = entry.targetId ? `<@${entry.targetId}>` : "Unknown target";
      const executor = `<@${executorId}>`;

      await logging.manager.send(guild, "moderation", {
        title: `🛡️ ${actionName}`,
        description: `**Moderator:** ${executor}\n**Target:** ${target}\n**Action:** ${actionName}`,
        color: "#5865F2",
        footer: "Nocthera Moderation Audit"
      }).catch(() => {});
    } catch (error) {
      logger.error(error?.stack ?? error);
    }
  }
};
