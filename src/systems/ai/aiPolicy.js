/**
 * ============================================================
 * Nocthera v1.1.0
 * AI Policy Engine
 * ============================================================
 */

import aiConfig from "./aiConfig.js";

class AIPolicy {

    constructor() {

        this.defaultRules = {

            spam: {

                enabled: true,

                repeatedMessageThreshold: 3,

                repeatedChannelThreshold: 3,

                warningThreshold: 1,

                timeoutThreshold: 4,

                banThreshold: 6,

                timeoutDuration: 60 * 60

            },

            moderation: {

                automaticWarnings: true,

                automaticTimeouts: true,

                automaticRoleRemoval: true,

                automaticBans: true

            },

            account: {

                enabled: true,

                suspiciousAccountAgeDays: 7,

                suspiciousMessageRate: 20,

                suspiciousJoinRate: 10

            },

            raid: {

                enabled: true,

                joinThreshold: 10,

                joinWindowSeconds: 30,

                messageThreshold: 20,

                messageWindowSeconds: 10

            },

            security: {

                enabled: true,

                lockdownOnCriticalThreat: true,

                notifyModerators: true,

                notifyAdministrators: true

            }

        };

    }

    // ========================================================
    // Create Policy
    // ========================================================

    create(overrides = {}) {

        const policy = structuredClone(

            this.defaultRules

        );

        return this.merge(

            policy,

            overrides

        );

    }

    // ========================================================
    // Merge Policy
    // ========================================================

    merge(base = {}, overrides = {}) {

        return {

            ...base,

            ...overrides,

            spam: {

                ...base.spam,

                ...(overrides.spam ?? {})

            },

            moderation: {

                ...base.moderation,

                ...(overrides.moderation ?? {})

            },

            account: {

                ...base.account,

                ...(overrides.account ?? {})

            },

            raid: {

                ...base.raid,

                ...(overrides.raid ?? {})

            },

            security: {

                ...base.security,

                ...(overrides.security ?? {})

            }

        };

    }

    // ========================================================
    // AI Permission
    // ========================================================

    canOperate(config = aiConfig.create()) {

        return Boolean(

            config.enabled &&
            config.autonomousActions

        );

    }

    // ========================================================
    // Moderation Permission
    // ========================================================

    canModerate(

        config = aiConfig.create(),

        policy = this.create()

    ) {

        if (!this.canOperate(config)) {

            return false;

        }

        return Boolean(

            policy.moderation.automaticWarnings ||
            policy.moderation.automaticTimeouts ||
            policy.moderation.automaticRoleRemoval ||
            policy.moderation.automaticBans

        );

    }

    // ========================================================
    // Warning
    // ========================================================

    canWarn(

        config = aiConfig.create(),

        policy = this.create()

    ) {

        return (

            this.canModerate(

                config,

                policy

            ) &&

            policy.moderation.automaticWarnings

        );

    }

    // ========================================================
    // Timeout
    // ========================================================

    canTimeout(

        config = aiConfig.create(),

        policy = this.create()

    ) {

        return (

            this.canModerate(

                config,

                policy

            ) &&

            policy.moderation.automaticTimeouts

        );

    }

    // ========================================================
    // Role Removal
    // ========================================================

    canRemoveRoles(

        config = aiConfig.create(),

        policy = this.create()

    ) {

        return (

            this.canModerate(

                config,

                policy

            ) &&

            policy.moderation.automaticRoleRemoval

        );

    }

    // ========================================================
    // Ban
    // ========================================================

    canBan(

        config = aiConfig.create(),

        policy = this.create()

    ) {

        return (

            this.canModerate(

                config,

                policy

            ) &&

            policy.moderation.automaticBans

        );

    }

    // ========================================================
    // Server Lockdown
    // ========================================================

    canLockdown(

        config = aiConfig.create(),

        policy = this.create()

    ) {

        return (

            this.canOperate(config) &&

            policy.security.enabled &&

            policy.security.lockdownOnCriticalThreat

        );

    }

    // ========================================================
    // Spam Detection
    // ========================================================

    shouldWarnSpam(

        count,

        policy = this.create()

    ) {

        return (

            policy.spam.enabled &&

            count >=
                policy.spam.warningThreshold

        );

    }

    shouldTimeoutSpam(

        count,

        policy = this.create()

    ) {

        return (

            policy.spam.enabled &&

            count >=
                policy.spam.timeoutThreshold

        );

    }

    shouldBanSpam(

        count,

        policy = this.create()

    ) {

        return (

            policy.spam.enabled &&

            count >=
                policy.spam.banThreshold

        );

    }

    // ========================================================
    // Repeated Message Detection
    // ========================================================

    isRepeatedMessage(

        count,

        policy = this.create()

    ) {

        return (

            policy.spam.enabled &&

            count >=
                policy.spam.repeatedMessageThreshold

        );

    }

    // ========================================================
    // Cross-Channel Spam Detection
    // ========================================================

    isCrossChannelSpam(

        channelCount,

        policy = this.create()

    ) {

        return (

            policy.spam.enabled &&

            channelCount >=
                policy.spam.repeatedChannelThreshold

        );

    }

    // ========================================================
    // Raid Detection
    // ========================================================

    isRaid(

        joinCount,

        policy = this.create()

    ) {

        return (

            policy.raid.enabled &&

            joinCount >=
                policy.raid.joinThreshold

        );

    }

    // ========================================================
    // Message Flood Detection
    // ========================================================

    isMessageFlood(

        messageCount,

        policy = this.create()

    ) {

        return (

            policy.raid.enabled &&

            messageCount >=
                policy.raid.messageThreshold

        );

    }

    // ========================================================
    // Suspicious Account
    // ========================================================

    isSuspiciousAccount({

        accountAgeDays = 0,

        messageRate = 0,

        joinRate = 0

    } = {}, policy = this.create()) {

        if (!policy.account.enabled) {

            return false;

        }

        if (
            accountAgeDays <
            policy.account.suspiciousAccountAgeDays
        ) {

            return true;

        }

        if (
            messageRate >
            policy.account.suspiciousMessageRate
        ) {

            return true;

        }

        if (
            joinRate >
            policy.account.suspiciousJoinRate
        ) {

            return true;

        }

        return false;

    }

    // ========================================================
    // Critical Threat
    // ========================================================

    isCriticalThreat({

        raid = false,

        massSpam = false,

        attack = false

    } = {}) {

        return Boolean(

            raid ||
            massSpam ||
            attack

        );

    }

    // ========================================================
    // Action Decision
    // ========================================================

    decide({

        spamCount = 0,

        channelCount = 0,

        joinCount = 0,

        messageCount = 0,

        account = {},

        raid = false,

        massSpam = false,

        attack = false,

        config = aiConfig.create(),

        policy = this.create()

    } = {}) {

        const actions = [];

        // ----------------------------------------------------
        // Spam
        // ----------------------------------------------------

        if (
            this.shouldWarnSpam(

                spamCount,

                policy

            ) &&
            this.canWarn(

                config,

                policy

            )
        ) {

            actions.push("warn");

        }

        // ----------------------------------------------------
        // Repeated Message
        // ----------------------------------------------------

        if (
            this.isRepeatedMessage(

                spamCount,

                policy

            )
        ) {

            if (
                !actions.includes("warn") &&
                this.canWarn(

                    config,

                    policy

                )
            ) {

                actions.push("warn");

            }

        }

        // ----------------------------------------------------
        // Cross Channel Spam
        // ----------------------------------------------------

        if (
            this.isCrossChannelSpam(

                channelCount,

                policy

            )
        ) {

            if (
                !actions.includes("warn") &&
                this.canWarn(

                    config,

                    policy

                )
            ) {

                actions.push("warn");

            }

        }

        // ----------------------------------------------------
        // Timeout
        // ----------------------------------------------------

        if (
            this.shouldTimeoutSpam(

                spamCount,

                policy

            ) &&
            this.canTimeout(

                config,

                policy

            )
        ) {

            actions.push("timeout");

            if (
                this.canRemoveRoles(

                    config,

                    policy

                )
            ) {

                actions.push("remove_roles");

            }

        }

        // ----------------------------------------------------
        // Ban
        // ----------------------------------------------------

        if (
            this.shouldBanSpam(

                spamCount,

                policy

            ) &&
            this.canBan(

                config,

                policy

            )
        ) {

            actions.push("ban");

        }

        // ----------------------------------------------------
        // Account
        // ----------------------------------------------------

        if (
            this.isSuspiciousAccount(

                account,

                policy

            )
        ) {

            actions.push(

                "flag_account"

            );

        }

        // ----------------------------------------------------
        // Raid
        // ----------------------------------------------------

        if (
            this.isRaid(

                joinCount,

                policy

            )
        ) {

            actions.push(

                "raid_alert"

            );

        }

        // ----------------------------------------------------
        // Message Flood
        // ----------------------------------------------------

        if (
            this.isMessageFlood(

                messageCount,

                policy

            )
        ) {

            actions.push(

                "mass_spam_alert"

            );

        }

        // ----------------------------------------------------
        // Critical Threat
        // ----------------------------------------------------

        const critical =
            this.isCriticalThreat({

                raid,

                massSpam,

                attack

            });

        if (critical) {

            actions.push(

                "critical_alert"

            );

            if (
                this.canLockdown(

                    config,

                    policy

                )
            ) {

                actions.push(

                    "lockdown"

                );

            }

            if (
                policy.security.notifyModerators
            ) {

                actions.push(

                    "notify_moderators"

                );

            }

            if (
                policy.security.notifyAdministrators
            ) {

                actions.push(

                    "notify_administrators"

                );

            }

        }

        return {

            actions: [

                ...new Set(actions)

            ],

            critical,

            policy

        };

    }

    // ========================================================
    // Validate Policy
    // ========================================================

    validate(policy) {

        if (
            !policy ||
            typeof policy !== "object"
        ) {

            return false;

        }

        if (
            !policy.spam ||
            typeof policy.spam !==
            "object"
        ) {

            return false;

        }

        if (
            !policy.moderation ||
            typeof policy.moderation !==
            "object"
        ) {

            return false;

        }

        if (
            !policy.account ||
            typeof policy.account !==
            "object"
        ) {

            return false;

        }

        if (
            !policy.raid ||
            typeof policy.raid !==
            "object"
        ) {

            return false;

        }

        if (
            !policy.security ||
            typeof policy.security !==
            "object"
        ) {

            return false;

        }

        return true;

    }

}

export default new AIPolicy();