# Nocthera v1.1.0 Roadmap

## Completed in v1.1.0

- Security enforcement hardening
- Anti-spam role and explicit-permission cleanup before timeout
- Anti-nuke lockdown, role cleanup, permission cleanup, and ban attempt when Discord hierarchy permits
- Trusted owner/co-owner exclusion from moderator activity logging and security detection
- Single security alert logging path to prevent duplicate embeds
- Join-to-Create voice system
  - Persistent creator-channel configuration
  - Per-member temporary voice channels
  - Automatic member transfer
  - Automatic deletion when empty
  - Restart reconciliation
  - Silent generated-channel create/delete lifecycle
- Existing safety/age-gated NSFW system included in the architecture registry
- Versioned architecture and documentation updated to 1.1.0

## Next

1. End-to-end Discord integration testing
2. Railway production validation
3. Security regression tests for trusted actors and generated channels
4. Join-to-Create concurrency/restart tests
5. Release v1.1.0

## Future

- Web dashboard
- Cloud backups
- Analytics
- Plugin API
- AI automation
