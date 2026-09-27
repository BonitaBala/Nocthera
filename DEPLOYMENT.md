# Nocthera v1.1.0 — Deployment Notes

## Current release

- AI system is intentionally disabled and reserved for a future update.
- Slash-command surface uses 11 top-level commands, well below Discord's 100-command application limit.
- Major systems are grouped behind top-level commands with subcommands where practical.

## Required environment

Set these before starting (Railway can provide `DATABASE_URL` automatically when the PostgreSQL service is linked):

- `BOT_TOKEN`
- `CLIENT_ID`
- `APPLICATION_ID`
- `DATABASE_URL`
- `DATABASE_SSL` (optional; Railway production defaults to SSL)
- `OWNER_ID`

For local development, copy `.env.example` to `.env` and fill in the values. Never commit `.env`.

## Install and run

```bash
npm install
npm start
```

## Validation

```bash
npm run validate
```

The validation command checks the tracked project folders and planned modules before startup.

## Command layout

- `/help`
- `/setup <system>`
- `/security <status|health|reset>`
- `/verify <verify|panel>`
- `/roles <panel|remove|toggle>`
- `/moderation <panel|warn|timeout|kick|ban|unban>`
- `/logs <panel|status>`
- `/tickets <panel|close|status>`
- `/community <panel|announce|autorole|counter|status>`
- `/embed <create|edit|delete|templates|save|remove>`
- `/music <status|queue|add|play|pause|resume|skip|stop|shuffle|clear|volume|loop>`

Some systems still expose state/control APIs that can be expanded in later releases without adding many top-level slash commands.
