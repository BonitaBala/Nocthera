/**
 * ============================================================
 * Nocthera v1.1.0
 * AI Configuration
 * ============================================================
 */

class AIConfig {

    constructor() {

        this.defaults = {

            // ==================================================
            // Core
            // ==================================================

            enabled: true,

            provider: "openai",

            model: "gpt-5.5",

            temperature: 0.7,

            maxTokens: 4000,

            systemPrompt:
                "You are Nocthera, an intelligent Discord server assistant.",

            // ==================================================
            // Interaction
            // ==================================================

            mentionOnly: true,

            allowDM: true,

            allowAttachments: true,

            allowImages: true,

            allowVision: true,

            allowCode: true,

            allowWebSearch: false,

            // ==================================================
            // Memory / Context
            // ==================================================

            allowMemory: true,

            memoryLimit: 25,

            contextMessages: 20,

            maxHistory: 100,

            // ==================================================
            // Rate Limits
            // ==================================================

            cooldown: 5,

            // ==================================================
            // AI Features
            // ==================================================

            streaming: true,

            typingIndicator: true,

            toolCalling: true,

            autonomousActions: true,

            serverMonitoring: true,

            ruleEnforcement: true,

            threatDetection: true,

            spamDetection: true,

            raidDetection: true,

            accountAnalysis: true,

            // ==================================================
            // Moderation
            // ==================================================

            automaticWarnings: true,

            automaticTimeouts: true,

            automaticRoleRemoval: true,

            automaticBans: true,

            // ==================================================
            // Safety
            // ==================================================

            requireModerationPermission: true,

            requireConfirmationForDestructiveActions: true,

            // ==================================================
            // Logging
            // ==================================================

            logConversations: false,

            logActions: true,

            logModeration: true,

            // ==================================================
            // Access
            // ==================================================

            moderatorOnly: false,

            blacklist: [],

            whitelist: []

        };

    }

    // ========================================================
    // Create Default Configuration
    // ========================================================

    create() {

        return structuredClone(

            this.defaults

        );

    }

    // ========================================================
    // Merge Configuration
    // ========================================================

    merge(config = {}) {

        const defaults = this.create();

        return {

            ...defaults,

            ...config,

            blacklist:
                Array.isArray(config.blacklist)

                    ? [...config.blacklist]

                    : [...defaults.blacklist],

            whitelist:
                Array.isArray(config.whitelist)

                    ? [...config.whitelist]

                    : [...defaults.whitelist]

        };

    }

    // ========================================================
    // Validate Configuration
    // ========================================================

    validate(config) {

        if (
            !config ||
            typeof config !== "object"
        ) {

            return false;

        }

        if (
            typeof config.enabled !==
            "boolean"
        ) {

            return false;

        }

        if (
            typeof config.provider !==
            "string" ||
            !config.provider.length
        ) {

            return false;

        }

        if (
            typeof config.model !==
            "string" ||
            !config.model.length
        ) {

            return false;

        }

        if (
            typeof config.temperature !==
            "number" ||
            config.temperature < 0 ||
            config.temperature > 2
        ) {

            return false;

        }

        if (
            typeof config.maxTokens !==
            "number" ||
            config.maxTokens < 1
        ) {

            return false;

        }

        if (
            typeof config.cooldown !==
            "number" ||
            config.cooldown < 0
        ) {

            return false;

        }

        if (
            typeof config.memoryLimit !==
            "number" ||
            config.memoryLimit < 0
        ) {

            return false;

        }

        if (
            typeof config.contextMessages !==
            "number" ||
            config.contextMessages < 1
        ) {

            return false;

        }

        if (
            typeof config.maxHistory !==
            "number" ||
            config.maxHistory < 1
        ) {

            return false;

        }

        if (
            !Array.isArray(config.blacklist) ||
            !Array.isArray(config.whitelist)
        ) {

            return false;

        }

        return true;

    }

}

export default new AIConfig();