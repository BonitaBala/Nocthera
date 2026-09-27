/**
 * Nocthera v1.1.0
 * Channel deletion event.
 *
 * Deliberately silent: audit/security handling is centralized in
 * guildAuditLogEntryCreate. This prevents duplicate embeds and keeps
 * Nocthera-created Join-to-Create voice channels out of server logs.
 */
export default {
  name: "channelDelete",
  once: false,
  async execute() {
    return;
  }
};
