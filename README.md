# 🌙 Nocthera v1.1.0

### **Nora — Modular Discord Security & Server Management Suite**

Nocthera is a production-oriented Discord bot built around a modular architecture for **security, moderation, verification, role management, tickets, embeds, logging, music, automation, community tools, voice utilities, and AI-assisted workflows**.

> **Codename:** Nora  
> **Version:** 1.1.0  
> **Runtime:** Node.js 24.17+  
> **Database:** PostgreSQL  
> **Library:** discord.js 14.x  
> **Deployment:** Railway / Render / Docker / VPS / Windows / Linux

---

## ✦ What Nocthera Is Built For

Nocthera is designed as a collection of independent systems rather than one large command file. Each major feature area has its own configuration, service/manager layer, interaction handlers, and persistence where required.

The result is a bot that can be configured around the needs of an individual Discord community while keeping security, moderation, logging, and server-management responsibilities centralized.

---

# 🛡️ Security Suite

Nocthera's security system is designed to detect suspicious server activity and respond automatically according to the configured protection policy.

### Protection layers

- **Anti-Raid** — detects abnormal join bursts and can trigger server lockdown protection.
- **Anti-Nuke** — monitors destructive administrative activity through Discord audit events.
- **Anti-Spam** — detects excessive message activity and can apply timeout/protection actions.
- **Anti-Bot** — detects newly added bot accounts and can automatically remove them when configured.
- **Anti-Invite** — protects against unauthorized invite activity.
- **Moderator Watch** — tracks destructive/moderation actions and supports configurable action thresholds.
- **Security Contacts** — owner and configured co-owner alerting.
- **Incident Tracking** — records security incidents and their response state.
- **Emergency Lockdown** — temporarily restricts communication when a serious incident is detected.
- **Security Recovery** — restores channels/permissions changed by temporary security lockdowns.
- **Security Self-Test** — provides diagnostics for the configured protection system.
- **Security Logging** — sends security events to the configured logging destination.

### Trusted administration

Owner and configured co-owner actions are treated as trusted administrative activity by the security monitoring layer and are intentionally excluded from normal moderation/server audit noise.

Nocthera-generated Join-to-Create channel lifecycle events are also excluded from ordinary moderation/server logs.

---

# 👮 Moderation

A full moderation layer for everyday server management.

- Ban
- Kick
- Timeout
- Warn
- Purge
- Lock / Unlock
- Slowmode
- Moderation cases
- Moderation history
- Permission-aware moderation actions
- Audit-based moderation logging
- Configurable moderation panels

Moderation actions can integrate with the security and logging systems so important actions remain traceable without unnecessarily duplicating events.

---

# 🔐 Verification & Anti-Bot Entry Protection

Nocthera includes a Discord-native verification system designed to keep the member-entry flow inside Discord.

### Verification capabilities

- Verification panels
- Verify buttons
- CAPTCHA challenges
- Attempt tracking
- Verification cooldowns
- Account-age checks
- Automatic verification criteria
- Verified/member role assignment
- Verification logs
- Auto-verification notifications
- Configurable verification channels
- Configurable verification roles

The CAPTCHA is intended as an additional anti-automation layer alongside Nocthera's anti-bot and anti-raid protections.

> **Privacy note:** Discord bots do not receive a member's IP address. Nocthera therefore does not claim to detect VPN usage from Discord-only interactions.

---

# 🎭 Role Management

The role system provides interactive role assignment and administration tools.

- Button roles
- Toggle roles
- Dropdown role panels
- Temporary roles
- Auto roles
- Role panels
- Role selection menus
- Role management configuration
- Persistent role-panel configuration
- Permission-aware role administration

Interactive role panels are designed to remain manageable even when role names or configurations change.

---

# ✨ Embed Builder

A visual-style Discord embed management system for creating and editing rich messages.

- Interactive embed builder
- Target channel selection
- Titles and descriptions
- Colors
- Footers
- Thumbnails
- Images
- Buttons
- Select menus
- Templates
- JSON import
- JSON export
- Embed editing workflows
- Persistent embed configuration

---

# 🎟️ Ticket System

A configurable support-ticket system for community staff.

- Multiple ticket panels
- Ticket creation
- Claim system
- Staff handling
- Auto-close support
- Transcripts
- Ticket logging
- Configurable ticket categories/settings
- Interactive ticket panels

---

# 📢 Community & Announcements

Community tools for server communication and administration.

- Community management panels
- Rich announcement embeds
- Announcement buttons
- Scheduled announcements
- Server information workflows
- Community configuration

---

# 🎵 Music

A voice-based music system built around Discord voice connections and queues.

- Play
- Queue
- Skip
- Pause
- Resume
- Shuffle
- Loop
- Queue management
- Voice connection handling
- Player lifecycle management

Music requires the appropriate Discord voice permissions and a working FFmpeg environment where required by the deployment.

---

# 🔊 Join-to-Create Voice

Nocthera includes a temporary personal voice-channel system.

### How it works

1. An administrator selects the creator voice channel through setup.
2. A member joins the creator channel.
3. Nocthera creates a personal temporary voice channel.
4. The member is moved into their new channel.
5. The temporary channel is automatically removed when everyone leaves.
6. Ownership/state can be recovered after a restart.

Generated Join-to-Create channel creation/deletion is deliberately excluded from ordinary moderation/server logs to prevent log spam.

---

# 📊 Logging

A centralized logging system for keeping important server activity organized.

### Logging categories include

- Moderation logs
- Member logs
- Voice logs
- Message logs
- Security logs
- Server/audit activity
- Verification activity
- Configurable log channels
- Category-aware log routing

The logging architecture is designed to avoid duplicate entries when the same event is already represented by a security incident or centralized audit handler.

---

# 🤖 AI & Automation

Nocthera contains an AI system designed around server assistance and administrative workflows.

- AI assistant framework
- AI configuration
- Server-assistance workflows
- AI-assisted moderation workflows
- AI-assisted embed workflows
- Setup/administration assistance
- Server analysis framework

AI capabilities depend on the providers/configuration enabled for the deployment. No AI provider credentials are required unless the corresponding AI functionality is enabled.

---

# 🔞 Administrator-Controlled Age-Restricted System

Nocthera contains an **administrator-controlled, age-restricted NSFW system** as part of its modular architecture.

The important design principle is that these capabilities are **not enabled automatically**. Server administrators control whether the system is enabled and where its restricted functionality is allowed to operate.

### NSFW system controls

- Dedicated NSFW configuration system
- Administrator/moderator permission checks
- NSFW channel gating
- Configuration management
- Feature enable/disable controls
- Dedicated NSFW command handling
- Separate system manager/service architecture

The NSFW system is intentionally separated from the normal community, moderation, and verification systems so administrators can control its availability independently.

> **Age restriction:** Discord's platform rules require age-restricted commands/content to be limited to eligible users and appropriate contexts. urlDiscord's age-restricted command documentationhttps://docs.discord.com/developers/docs/interactions/slash-commands

---

# ⚙️ Setup & Configuration

Nocthera includes a centralized setup system for configuring server-specific features.

Typical configuration areas include:

- Verification channel and role
- Logging channels
- Security settings
- Security contacts/co-owners
- Moderation settings
- Role panels
- Ticket panels
- Embed configuration
- Join-to-Create voice channel
- Community settings
- NSFW system permissions/settings

Server configuration is persisted through PostgreSQL where supported by the individual system.

---

# 🗄️ PostgreSQL

PostgreSQL is used for persistent server configuration and system state.

The primary Railway deployment variable is:

```text
DATABASE_URL
```

If using Railway's PostgreSQL service, the database connection can be supplied through Railway's service-variable reference system.

Additional database settings supported by the application include SSL configuration and optional database-name configuration where applicable.

---

# 🚂 Railway Deployment

Nocthera is designed to run as a long-lived Node.js service on Railway.

### Core variables

```text
BOT_TOKEN
CLIENT_ID
APPLICATION_ID
OWNER_ID
DATABASE_URL
```

Common optional configuration variables supported by the application include:

```text
BOT_NAME
BOT_VERSION
DEFAULT_LANGUAGE
PREFIX
LOG_LEVEL
NODE_ENV
SECURITY_MODE
DATABASE_SSL
DATABASE_NAME
FFMPEG_PATH
DASHBOARD_ENABLED
DASHBOARD_PORT
AI_PROVIDER
OPENAI_MODEL
```

Only add optional variables when the related functionality requires them.

> **Security:** Never commit `BOT_TOKEN`, database credentials, API keys, or other secrets to the repository.

---

# 🐳 Docker

Nocthera can be deployed with Docker using the included deployment configuration.

```bash
npm install
npm start
```

For development:

```bash
npm run dev
```

For validation:

```bash
npm run validate
```

---

# 🧩 Architecture

```text
Nocthera
│
├── Core
│   ├── Configuration
│   ├── Logger
│   ├── Permissions
│   ├── Database
│   └── Architecture Validation
│
├── Commands
│   └── System command modules
│
├── Events
│   └── Discord gateway/audit events
│
└── Systems
    ├── AI
    ├── Community
    ├── Embeds
    ├── Logging
    ├── Moderation
    ├── Music
    ├── NSFW
    ├── Roles
    ├── Security
    ├── Setup
    ├── Tickets
    ├── Verification
    └── Voice / Join-to-Create
```

Each major system is isolated so features can evolve without turning the bot into one monolithic handler.

---

# 🧪 Validation & Reliability

The project includes architecture validation and automated source checks.

The v1.1.0 maintenance work includes safeguards around:

- Discord interaction acknowledgement
- Select-menu routing
- Modal routing
- Dynamic component IDs
- Role-panel component limits
- Security-event deduplication
- Audit-log handling
- Configuration persistence
- Join-to-Create lifecycle handling
- Graceful shutdown
- PostgreSQL connection handling

Discord interactions are handled through discord.js components such as buttons, select menus, and modals. citeturn0search1turn0search8

---

# 📁 Project Structure

```text
src/
├── commands/
├── core/
├── events/
├── systems/
│   ├── ai/
│   ├── community/
│   ├── embeds/
│   ├── logging/
│   ├── moderation/
│   ├── music/
│   ├── nsfw/
│   ├── roles/
│   ├── security/
│   ├── setup/
│   ├── tickets/
│   ├── verification/
│   └── voice/
├── app.js
└── client.js
```

---

# 📌 Version

**Nocthera v1.1.0 — Nora**

This release focuses on strengthening the modular server-management architecture, security monitoring, verification, interactive configuration panels, Join-to-Create voice, logging, and operational reliability.

---

## 📜 License

MIT License

---

### Built for communities that want one modular control center.

**🌙 Nocthera — Security. Management. Automation.**
