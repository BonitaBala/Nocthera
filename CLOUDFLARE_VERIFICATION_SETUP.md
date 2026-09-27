# Nocthera Cloudflare Verification Setup

Nocthera can place Cloudflare Turnstile before its optional Discord CAPTCHA. Turnstile is validated server-side before a member can continue.

## Railway variables

Required to enable the Cloudflare step:

- `TURNSTILE_ENABLED=true`
- `TURNSTILE_SITE_KEY=<Cloudflare Turnstile site key>`
- `TURNSTILE_SECRET=<Cloudflare Turnstile secret key>`
- `VERIFICATION_BASE_URL=https://<your-public-railway-domain>`

Optional VPN/proxy detection:

- `VPN_CHECK_ENABLED=true`
- `IPINFO_TOKEN=<IPinfo token with privacy detection access>`

`PORT` is supplied by Railway. No additional web dependency is required; Nocthera uses Node's built-in HTTP server.

## Flow

1. Member clicks Verify in Discord.
2. If Turnstile is enabled, Nocthera sends a one-time web verification link.
3. Cloudflare Turnstile runs in the browser.
4. Nocthera validates the token with Cloudflare Siteverify.
5. If VPN/proxy detection is enabled and the connecting IP is flagged, the web page blocks the check and Nocthera attempts to DM the member asking them to turn off the VPN/proxy.
6. If Discord CAPTCHA is enabled, the member returns to Discord and clicks Verify again; the existing CAPTCHA modal appears.
7. After the CAPTCHA is correct, Nocthera assigns the verified role.

Discord does not expose a joining member's IP address to bots, so VPN detection cannot be performed directly from `guildMemberAdd`. It can be performed when the member reaches the web security check, which is the first point in this flow where Nocthera receives a client IP.

## Security notes

- Never expose `TURNSTILE_SECRET` or `IPINFO_TOKEN` in source code or logs.
- Turnstile tokens are short-lived and single-use; Nocthera validates them server-side.
