/**
 * Nocthera v1.1.0 - Verification Configuration
 */

const DEFAULT_EMBED = {
    color: 0x5865F2,
    title: "🛡️ Server Verification",
    description: "Welcome to **{server}**.\n\nClick **Verify** below to confirm you are a member of this community and receive access to verified channels.",
    footer: { text: "{server} • Nocthera Verification" },
    timestamp: true,
    fields: []
};

class VerificationConfig {
    constructor() {
        this.defaults = {
            enabled: false,
            verifiedRole: null,
            unverifiedRole: null,
            panelChannel: null,
            panelMessage: null,
            logChannel: null,
            protections: {
                accountAge: false,
                minimumAccountAge: 7,
                captcha: false,
                captchaLength: 6,
                joinGracePeriod: false,
                joinGraceMinutes: 0,
                removeUnverifiedRole: true,
                bypassRoles: []
            },
            embed: structuredClone(DEFAULT_EMBED),
            button: {
                label: "Verify",
                style: "success",
                emoji: "✅"
            }
        };
    }

    create() {
        return structuredClone(this.defaults);
    }

    merge(config = {}) {
        const base = this.create();
        const merged = {
            ...base,
            ...config,
            protections: {
                ...base.protections,
                ...(config.protections || {}),
                bypassRoles: Array.isArray(config.protections?.bypassRoles)
                    ? [...config.protections.bypassRoles]
                    : [...base.protections.bypassRoles]
            },
            embed: {
                ...base.embed,
                ...(config.embed || {}),
                fields: Array.isArray(config.embed?.fields) ? [...config.embed.fields] : [...base.embed.fields]
            },
            button: {
                ...base.button,
                ...(config.button || {})
            }
        };

        return merged;
    }

    validate(config) {
        if (!config || typeof config !== "object") return false;
        if (typeof config.enabled !== "boolean") return false;
        if (config.verifiedRole && !/^\d{15,25}$/.test(String(config.verifiedRole))) return false;
        if (config.panelChannel && !/^\d{15,25}$/.test(String(config.panelChannel))) return false;
        if (config.panelMessage && !/^\d{15,25}$/.test(String(config.panelMessage))) return false;
        if (!config.protections || typeof config.protections !== "object") return false;
        if (!Number.isInteger(Number(config.protections.minimumAccountAge)) || Number(config.protections.minimumAccountAge) < 0) return false;
        if (!Number.isInteger(Number(config.protections.captchaLength)) || Number(config.protections.captchaLength) < 4 || Number(config.protections.captchaLength) > 8) return false;
        return true;
    }
}

export { DEFAULT_EMBED };
export default new VerificationConfig();
