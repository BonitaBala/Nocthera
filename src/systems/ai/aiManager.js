/**
 * ============================================================
 * Nocthera v1.1.0
 * AI Manager
 * ============================================================
 *
 * Central action orchestrator for the AI system.
 *
 * Responsibilities:
 * - Register AI actions
 * - Validate and execute actions
 * - Route actions to existing Nocthera systems
 * - Execute policy decisions
 * - Prevent duplicate action execution
 *
 * The AI Manager does NOT directly implement:
 * - Moderation
 * - Security
 * - Roles
 * - Verification
 * - Logging
 * - Tickets
 * - Embeds
 *
 * Those systems remain the source of truth.
 * ============================================================
 */

import aiCore from "./aiCore.js";
import aiService from "./aiService.js";

class AIManager {

    constructor() {

        // ====================================================
        // Action Registry
        // ====================================================

        this.actions = new Map();

        // ====================================================
        // Action History
        // ====================================================

        this.actionHistory = new Map();

        // ====================================================
        // Execution Locks
        // ====================================================

        this.executionLocks = new Map();

        // ====================================================
        // Statistics
        // ====================================================

        this.stats = {

            executed: 0,

            successful: 0,

            failed: 0,

            blocked: 0

        };

        // ====================================================
        // Register Defaults
        // ====================================================

        this.registerDefaultActions();

    }

    // ========================================================
    // Register Default Actions
    // ========================================================

    registerDefaultActions() {

        // ----------------------------------------------------
        // Moderation
        // ----------------------------------------------------

        this.register(

            "warn",

            async context =>

                this.executeModeration(

                    "warn",

                    context

                )

        );

        this.register(

            "timeout",

            async context =>

                this.executeModeration(

                    "timeout",

                    context

                )

        );

        this.register(

            "remove_roles",

            async context =>

                this.executeSystem(

                    "roles",

                    "remove_roles",

                    context

                )

        );

        this.register(

            "ban",

            async context =>

                this.executeModeration(

                    "ban",

                    context

                )

        );

        this.register(

            "kick",

            async context =>

                this.executeModeration(

                    "kick",

                    context

                )

        );

        // ----------------------------------------------------
        // Security
        // ----------------------------------------------------

        this.register(

            "lockdown",

            async context =>

                this.executeSecurity(

                    "lockdown",

                    context

                )

        );

        this.register(

            "raid_alert",

            async context =>

                this.executeSecurity(

                    "raid_alert",

                    context

                )

        );

        this.register(

            "mass_spam_alert",

            async context =>

                this.executeSecurity(

                    "mass_spam_alert",

                    context

                )

        );

        this.register(

            "critical_alert",

            async context =>

                this.executeSecurity(

                    "critical_alert",

                    context

                )

        );

        this.register(

            "flag_account",

            async context =>

                this.executeSecurity(

                    "flag_account",

                    context

                )

        );

        // ----------------------------------------------------
        // Notifications
        // ----------------------------------------------------

        this.register(

            "notify_moderators",

            async context =>

                this.executeSystem(

                    "logging",

                    "notify_moderators",

                    context

                )

        );

        this.register(

            "notify_administrators",

            async context =>

                this.executeSystem(

                    "logging",

                    "notify_administrators",

                    context

                )

        );

        // ----------------------------------------------------
        // Logging
        // ----------------------------------------------------

        this.register(

            "log_action",

            async context =>

                this.executeSystem(

                    "logging",

                    "log_action",

                    context

                )

        );

        // ----------------------------------------------------
        // Verification
        // ----------------------------------------------------

        this.register(

            "verify",

            async context =>

                this.executeSystem(

                    "verification",

                    "verify",

                    context

                )

        );

        this.register(

            "flag_verification",

            async context =>

                this.executeSystem(

                    "verification",

                    "flag",

                    context

                )

        );

        // ----------------------------------------------------
        // Tickets
        // ----------------------------------------------------

        this.register(

            "create_ticket",

            async context =>

                this.executeSystem(

                    "tickets",

                    "create",

                    context

                )

        );

        // ----------------------------------------------------
        // Embeds
        // ----------------------------------------------------

        this.register(

            "create_embed",

            async context =>

                this.executeSystem(

                    "embeds",

                    "create",

                    context

                )

        );

        // ----------------------------------------------------
        // Generic System Action
        // ----------------------------------------------------

        this.register(

            "system",

            async context =>

                this.executeSystem(

                    context.system,

                    context.action,

                    context

                )

        );

    }

    // ========================================================
    // Register Action
    // ========================================================

    register(name, handler) {

        if (

            !name ||

            typeof name !==
                "string" ||

            typeof handler !==
                "function"

        ) {

            return false;

        }

        this.actions.set(

            name,

            handler

        );

        return true;

    }

    // ========================================================
    // Unregister Action
    // ========================================================

    unregister(name) {

        return this.actions.delete(

            name

        );

    }

    // ========================================================
    // Check Action
    // ========================================================

    has(name) {

        return this.actions.has(

            name

        );

    }

    // ========================================================
    // List Actions
    // ========================================================

    list() {

        return [

            ...this.actions.keys()

        ];

    }

    // ========================================================
    // Action History Key
    // ========================================================

    getHistoryKey(

        action,

        context = {}

    ) {

        const guildId =
            context.guildId ??
            context.guild?.id ??
            "global";

        const userId =
            context.userId ??
            context.member?.id ??
            context.member?.user?.id ??
            "system";

        return (

            `${guildId}:` +

            `${userId}:` +

            `${action}`

        );

    }

    // ========================================================
    // Check Duplicate Execution
    // ========================================================

    hasRecentExecution(

        action,

        context = {},

        window = 3000

    ) {

        const key =
            this.getHistoryKey(

                action,

                context

            );

        const timestamp =
            this.actionHistory.get(

                key

            );

        if (!timestamp) {

            return false;

        }

        return (

            Date.now() -
            timestamp <
            window

        );

    }

    // ========================================================
    // Record Execution
    // ========================================================

    recordExecution(

        action,

        context = {}

    ) {

        const key =
            this.getHistoryKey(

                action,

                context

            );

        this.actionHistory.set(

            key,

            Date.now()

        );

    }

    // ========================================================
    // Execution Lock
    // ========================================================

    isLocked(key) {

        const expires =
            this.executionLocks.get(

                key

            );

        if (!expires) {

            return false;

        }

        if (
            Date.now() >=
            expires
        ) {

            this.executionLocks.delete(

                key

            );

            return false;

        }

        return true;

    }

    lock(

        key,

        duration = 5000

    ) {

        this.executionLocks.set(

            key,

            Date.now() +
            duration

        );

    }

    unlock(key) {

        this.executionLocks.delete(

            key

        );

    }

    // ========================================================
    // Statistics
    // ========================================================

    getStats() {

        return {

            ...this.stats

        };

    }

    resetStats() {

        this.stats = {

            executed: 0,

            successful: 0,

            failed: 0,

            blocked: 0

        };

    }

         // ========================================================
    // Validate Action
    // ========================================================

    validateAction(

        name,

        context = {}

    ) {

        if (!name) {

            return {

                allowed: false,

                reason:
                    "Missing action name."

            };

        }

        if (!this.actions.has(name)) {

            return {

                allowed: false,

                reason:
                    `Unknown AI action: ${name}`

            };

        }

        if (!context ||
            typeof context !== "object") {

            return {

                allowed: false,

                reason:
                    "Invalid action context."

            };

        }

        return {

            allowed: true,

            reason: null

        };

    }

    // ========================================================
    // Permission Check
    // ========================================================

    canExecute(

        action,

        context = {}

    ) {

        const config =

            context.config ??

            (

                context.guildId

                    ? aiService.getConfig(

                        context.guildId

                    )

                    : null

            );

        if (!config) {

            return {

                allowed: true,

                reason: null

            };

        }

        // ----------------------------------------------------
        // AI must be enabled
        // ----------------------------------------------------

        if (!config.enabled) {

            return {

                allowed: false,

                reason:
                    "AI system is disabled."

            };

        }

        // ----------------------------------------------------
        // Autonomous actions
        // ----------------------------------------------------

        const destructive = [

            "timeout",

            "ban",

            "kick",

            "remove_roles",

            "lockdown",

            "mass_spam_alert",

            "critical_alert"

        ];

        if (

            destructive.includes(action) &&

            !config.autonomousActions

        ) {

            return {

                allowed: false,

                reason:
                    "Autonomous AI actions are disabled."

            };

        }

        // ----------------------------------------------------
        // Moderation
        // ----------------------------------------------------

        const moderationActions = [

            "warn",

            "timeout",

            "ban",

            "kick",

            "remove_roles"

        ];

        if (

            moderationActions.includes(action) &&

            !config.ruleEnforcement

        ) {

            return {

                allowed: false,

                reason:
                    "AI rule enforcement is disabled."

            };

        }

        // ----------------------------------------------------
        // Security
        // ----------------------------------------------------

        const securityActions = [

            "lockdown",

            "raid_alert",

            "mass_spam_alert",

            "critical_alert",

            "flag_account"

        ];

        if (

            securityActions.includes(action) &&

            !config.threatDetection

        ) {

            return {

                allowed: false,

                reason:
                    "AI threat detection is disabled."

            };

        }

        // ----------------------------------------------------
        // Monitoring
        // ----------------------------------------------------

        if (

            (

                action === "raid_alert" ||

                action === "mass_spam_alert" ||

                action === "critical_alert"

            ) &&

            !config.serverMonitoring

        ) {

            return {

                allowed: false,

                reason:
                    "Server monitoring is disabled."

            };

        }

        // ----------------------------------------------------
        // Spam
        // ----------------------------------------------------

        if (

            (

                action === "warn" ||

                action === "timeout" ||

                action === "remove_roles"

            ) &&

            context.spamDetected &&

            !config.spamDetection

        ) {

            return {

                allowed: false,

                reason:
                    "Spam detection is disabled."

            };

        }

        // ----------------------------------------------------
        // Raid
        // ----------------------------------------------------

        if (

            action === "raid_alert" &&

            !config.raidDetection

        ) {

            return {

                allowed: false,

                reason:
                    "Raid detection is disabled."

            };

        }

        // ----------------------------------------------------
        // Account Analysis
        // ----------------------------------------------------

        if (

            action === "flag_account" &&

            !config.accountAnalysis

        ) {

            return {

                allowed: false,

                reason:
                    "Account analysis is disabled."

            };

        }

        return {

            allowed: true,

            reason: null

        };

    }

    // ========================================================
    // Execute Action
    // ========================================================

    async execute(

        name,

        context = {}

    ) {

        this.stats.executed++;

        // ----------------------------------------------------
        // Validate
        // ----------------------------------------------------

        const validation =

            this.validateAction(

                name,

                context

            );

        if (!validation.allowed) {

            this.stats.blocked++;

            return {

                success: false,

                blocked: true,

                action: name,

                reason:
                    validation.reason

            };

        }

        // ----------------------------------------------------
        // Permission
        // ----------------------------------------------------

        const permission =

            this.canExecute(

                name,

                context

            );

        if (!permission.allowed) {

            this.stats.blocked++;

            return {

                success: false,

                blocked: true,

                action: name,

                reason:
                    permission.reason

            };

        }

        // ----------------------------------------------------
        // Duplicate Protection
        // ----------------------------------------------------

        if (

            context.preventDuplicate !== false &&

            this.hasRecentExecution(

                name,

                context,

                context.duplicateWindow ??
                    3000

            )

        ) {

            this.stats.blocked++;

            return {

                success: false,

                blocked: true,

                duplicate: true,

                action: name,

                reason:
                    "Duplicate action prevented."

            };

        }

        // ----------------------------------------------------
        // Execution Lock
        // ----------------------------------------------------

        const lockKey =

            context.lockKey ??

            this.getHistoryKey(

                name,

                context

            );

        if (this.isLocked(lockKey)) {

            this.stats.blocked++;

            return {

                success: false,

                blocked: true,

                locked: true,

                action: name,

                reason:
                    "Action is already executing."

            };

        }

        this.lock(

            lockKey,

            context.lockDuration ??
                5000

        );

        // ----------------------------------------------------
        // Execute
        // ----------------------------------------------------

        try {

            const handler =

                this.actions.get(name);

            const result =

                await handler(

                    {

                        ...context,

                        action: name,

                        manager: this,

                        core: aiCore,

                        service: aiService

                    }

                );

            this.recordExecution(

                name,

                context

            );

            this.stats.successful++;

            return {

                success: true,

                blocked: false,

                action: name,

                result

            };

        }

        catch (error) {

            this.stats.failed++;

            return {

                success: false,

                blocked: false,

                action: name,

                error:
                    error?.message ??
                    String(error)

            };

        }

        finally {

            this.unlock(

                lockKey

            );

        }

    }

    // ========================================================
    // Execute Multiple Actions
    // ========================================================

    async executeMany(

        actions = [],

        context = {}

    ) {

        if (!Array.isArray(actions)) {

            return [];

        }

        const results = [];

        for (const item of actions) {

            let name = item;

            let actionContext = {

                ...context

            };

            if (

                item &&

                typeof item === "object"

            ) {

                name = item.action ??
                    item.name;

                actionContext = {

                    ...context,

                    ...item.context

                };

            }

            if (!name) {

                results.push({

                    success: false,

                    blocked: true,

                    reason:
                        "Missing action name."

                });

                continue;

            }

            results.push(

                await this.execute(

                    name,

                    actionContext

                )

            );

        }

        return results;

    }

    // ========================================================
    // Execute Policy Decisions
    // ========================================================

    async executeDecision(

        decision,

        context = {}

    ) {

        if (!decision) {

            return {

                success: false,

                blocked: true,

                reason:
                    "Missing policy decision."

            };

        }

        const actions =

            Array.isArray(

                decision.actions

            )

                ? decision.actions

                : [];

        if (!actions.length) {

            return {

                success: true,

                actions: [],

                results: []

            };

        }

        return {

            success: true,

            actions,

            results:

                await this.executeMany(

                    actions,

                    context

                )

        };

    }

    // ========================================================
    // Moderation Bridge
    // ========================================================

    async executeModeration(

        action,

        context = {}

    ) {

        return aiService.executeTool(

            {

                name:
                    "moderation",

                action,

                ...context

            },

            context

        );

    }

    // ========================================================
    // Security Bridge
    // ========================================================

    async executeSecurity(

        action,

        context = {}

    ) {

        return aiService.executeTool(

            {

                name:
                    "security",

                action,

                ...context

            },

            context

        );

    }

    // ========================================================
    // System Bridge
    // ========================================================

    async executeSystem(

        system,

        action,

        context = {}

    ) {

        if (!system) {

            return {

                success: false,

                error:
                    "Missing system."

            };

        }

        return aiService.executeTool(

            {

                name: system,

                action,

                ...context

            },

            context

        );

    }

         // ========================================================
    // Policy Evaluation
    // ========================================================

    evaluatePolicy(context = {}) {

        if (
            !aiCore ||
            typeof aiCore.evaluate !==
                "function"
        ) {

            return {

                actions: [],

                critical: false,

                error:
                    "AI Core policy engine unavailable."

            };

        }

        return aiCore.evaluate(

            context

        );

    }

    // ========================================================
    // Evaluate And Execute
    // ========================================================

    async evaluateAndExecute(

        context = {}

    ) {

        const decision =

            this.evaluatePolicy(

                context

            );

        if (decision.error) {

            return {

                success: false,

                decision,

                results: []

            };

        }

        const execution =

            await this.executeDecision(

                decision,

                context

            );

        return {

            success:
                execution.success,

            decision,

            results:
                execution.results

        };

    }

    // ========================================================
    // Security Evaluation
    // ========================================================

    async evaluateSecurity(

        context = {}

    ) {

        if (
            !aiCore ||
            typeof aiCore.evaluateSecurity !==
                "function"
        ) {

            return {

                success: false,

                critical: false,

                error:
                    "AI Core security engine unavailable."

            };

        }

        return aiCore.evaluateSecurity(

            context

        );

    }

    // ========================================================
    // Security Response
    // ========================================================

    async respondToThreat(

        context = {}

    ) {

        const security =

            await this.evaluateSecurity(

                context

            );

        if (!security) {

            return {

                success: false,

                results: []

            };

        }

        if (
            security.error
        ) {

            return {

                success: false,

                security,

                results: []

            };

        }

        const actions =

            Array.isArray(

                security.actions

            )

                ? security.actions

                : [];

        if (!actions.length) {

            return {

                success: true,

                critical:
                    Boolean(

                        security.critical

                    ),

                security,

                results: []

            };

        }

        const results =

            await this.executeMany(

                actions,

                {

                    ...context,

                    security

                }

            );

        return {

            success: true,

            critical:
                Boolean(

                    security.critical

                ),

            security,

            actions,

            results

        };

    }

    // ========================================================
    // Spam Response
    // ========================================================

    async respondToSpam(

        context = {}

    ) {

        return this.evaluateAndExecute(

            {

                ...context,

                spamDetected: true

            }

        );

    }

    // ========================================================
    // Raid Response
    // ========================================================

    async respondToRaid(

        context = {}

    ) {

        return this.evaluateAndExecute(

            {

                ...context,

                raid: true

            }

        );

    }

    // ========================================================
    // Attack Response
    // ========================================================

    async respondToAttack(

        context = {}

    ) {

        return this.evaluateAndExecute(

            {

                ...context,

                attack: true

            }

        );

    }

    // ========================================================
    // Account Analysis Response
    // ========================================================

    async respondToSuspiciousAccount(

        context = {}

    ) {

        return this.evaluateAndExecute(

            {

                ...context,

                account:

                    context.account ??

                    {

                        accountAgeDays:
                            0,

                        messageRate:
                            0,

                        joinRate:
                            0

                    }

            }

        );

    }

    // ========================================================
    // Direct User Moderation
    // ========================================================

    async moderateUser(

        action,

        context = {}

    ) {

        const allowedActions = [

            "warn",

            "timeout",

            "remove_roles",

            "ban",

            "kick"

        ];

        if (
            !allowedActions.includes(

                action

            )
        ) {

            return {

                success: false,

                blocked: true,

                reason:
                    "Unsupported moderation action."

            };

        }

        return this.execute(

            action,

            context

        );

    }

    // ========================================================
    // Create Embed Through Existing System
    // ========================================================

    async createEmbed(

        context = {}

    ) {

        return this.execute(

            "create_embed",

            context

        );

    }

    // ========================================================
    // Create Ticket Through Existing System
    // ========================================================

    async createTicket(

        context = {}

    ) {

        return this.execute(

            "create_ticket",

            context

        );

    }

    // ========================================================
    // Verify Through Existing System
    // ========================================================

    async verifyMember(

        context = {}

    ) {

        return this.execute(

            "verify",

            context

        );

    }

    // ========================================================
    // Logging Through Existing System
    // ========================================================

    async logAction(

        context = {}

    ) {

        return this.execute(

            "log_action",

            context

        );

    }

    // ========================================================
    // Status
    // ========================================================

    getStatus() {

        return {

            actions:
                this.actions.size,

            actionNames:
                this.list(),

            locks:
                this.executionLocks.size,

            history:
                this.actionHistory.size,

            stats:
                this.getStats(),

            core:
                aiCore &&
                typeof aiCore.getStatus ===
                    "function"

                    ? aiCore.getStatus()

                    : null

        };

    }

    // ========================================================
    // Cleanup
    // ========================================================

    cleanup() {

        this.actionHistory.clear();

        this.executionLocks.clear();

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        this.cleanup();

        this.actions.clear();

        this.resetStats();

    }

}

// ============================================================
// Singleton
// ============================================================

export default new AIManager();