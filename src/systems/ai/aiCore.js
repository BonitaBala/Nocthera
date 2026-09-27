/**
 * ============================================================
 * Nocthera v1.1.0
 * AI Core
 * ============================================================
 */

import aiConfig from "./aiConfig.js";
import aiPolicy from "./aiPolicy.js";
import aiService from "./aiService.js";

class AICore {

    constructor() {

        this.client = null;

        this.initialized = false;

        this.started = false;

        this.monitoring = false;

        // ====================================================
        // Monitoring State
        // ====================================================

        this.monitoringListeners = [];

        this.monitoringTimers = new Set();

        // ====================================================
        // Detection State
        // ====================================================

        this.messageTracker = new Map();

        this.joinTracker = new Map();

        this.accountTracker = new Map();

        this.violationTracker = new Map();

        // ====================================================
        // Security State
        // ====================================================

        this.activeThreats = new Map();

        this.lockdowns = new Map();

    }

    // ========================================================
    // Initialize
    // ========================================================

    async initialize(client) {

        if (!client) {

            throw new Error(
                "Discord client is required."
            );

        }

        if (this.initialized) {

            return true;

        }

        this.client = client;

        await aiService.initialize(

            client

        );

        this.initialized = true;

        return true;

    }

    // ========================================================
    // Start
    // ========================================================

    async start() {

        if (!this.initialized) {

            throw new Error(
                "AI Core is not initialized."
            );

        }

        if (this.started) {

            return true;

        }

        const config =
            aiConfig.create();

        if (!config.enabled) {

            return false;

        }

        this.started = true;

        if (
            config.serverMonitoring !== false
        ) {

            this.startMonitoring();

        }

        return true;

    }

    // ========================================================
    // Monitoring
    // ========================================================

    startMonitoring() {

        if (
            this.monitoring ||
            !this.client
        ) {

            return false;

        }

        this.monitoring = true;

        this.registerMonitoringListeners();

        return true;

    }

    stopMonitoring() {

        this.removeMonitoringListeners();

        this.monitoring = false;

        return true;

    }

    isMonitoring() {

        return this.monitoring;

    }

    // ========================================================
    // Monitoring Listeners
    // ========================================================

    registerMonitoringListeners() {

        if (!this.client) {

            return false;

        }

        this.removeMonitoringListeners();

        const messageListener =
            message => {

                this.processMessage(

                    message

                ).catch(

                    () => {}

                );

            };

        const joinListener =
            member => {

                this.processMemberJoin(

                    member

                ).catch(

                    () => {}

                );

            };

        const leaveListener =
            member => {

                this.processMemberLeave(

                    member

                ).catch(

                    () => {}

                );

            };

        this.client.on(

            "messageCreate",

            messageListener

        );

        this.client.on(

            "guildMemberAdd",

            joinListener

        );

        this.client.on(

            "guildMemberRemove",

            leaveListener

        );

        this.monitoringListeners.push(

            {

                event:
                    "messageCreate",

                listener:
                    messageListener

            },

            {

                event:
                    "guildMemberAdd",

                listener:
                    joinListener

            },

            {

                event:
                    "guildMemberRemove",

                listener:
                    leaveListener

            }

        );

        return true;

    }

    removeMonitoringListeners() {

        if (!this.client) {

            this.monitoringListeners = [];

            return;

        }

        for (

            const item

            of this.monitoringListeners

        ) {

            this.client.removeListener(

                item.event,

                item.listener

            );

        }

        this.monitoringListeners = [];

    }

    // ========================================================
    // Configuration
    // ========================================================

    getConfig(guildId) {

        return aiService.getConfig(

            guildId

        );

    }

    setConfig(guildId, config) {

        const merged =
            aiConfig.merge(config);

        if (
            !aiConfig.validate(
                merged
            )
        ) {

            return false;

        }

        return aiService.setConfig(

            guildId,

            merged

        );

    }

    // ========================================================
    // Policy
    // ========================================================

    getPolicy(overrides = {}) {

        return aiPolicy.create(

            overrides

        );

    }

    evaluate(context = {}) {

        const guildId =
            context.guildId ?? null;

        const config =
            guildId

                ? this.getConfig(
                    guildId
                )

                : aiConfig.create();

        const policy =
            this.getPolicy(

                context.policy ?? {}

            );

        return aiPolicy.decide({

            spamCount:
                context.spamCount ?? 0,

            joinCount:
                context.joinCount ?? 0,

            account:
                context.account ?? {},

            raid:
                Boolean(
                    context.raid
                ),

            massSpam:
                Boolean(
                    context.massSpam
                ),

            attack:
                Boolean(
                    context.attack
                )

        }, {

            ...policy,

            config

        });

    }

    // ========================================================
    // Chat
    // ========================================================

    async chat(options = {}) {

        if (!this.initialized) {

            throw new Error(
                "AI Core is not initialized."
            );

        }

        return aiService.chat(

            options

        );

    }

    // ========================================================
    // Tools
    // ========================================================

    async executeTool(

        tool,

        context = {}

    ) {

        return aiService.executeTool(

            tool,

            context

        );

    }

    async executeTools(

        tools = [],

        context = {}

    ) {

        return aiService.executeTools(

            tools,

            context

        );

    }

    // ========================================================
    // Security Evaluation
    // ========================================================

    async evaluateSecurity(

        context = {}

    ) {

        const result =
            this.evaluate(

                context

            );

        if (!result.critical) {

            return result;

        }

        return {

            ...result,

            security: true,

            threat: {

                raid:
                    Boolean(
                        context.raid
                    ),

                massSpam:
                    Boolean(
                        context.massSpam
                    ),

                attack:
                    Boolean(
                        context.attack
                    )

            }

        };

    }

    // ========================================================
    // Message Processing
    // ========================================================

    async processMessage(message) {

        if (
            !this.monitoring ||
            !message ||
            !message.guild ||
            message.author?.bot
        ) {

            return null;

        }

        const guildId =
            message.guild.id;

        const userId =
            message.author.id;

        const content =
            String(
                message.content ?? ""
            ).trim();

        if (!content) {

            return null;

        }

        const config =
            this.getConfig(

                guildId

            );

        if (!config.enabled) {

            return null;

        }

        // ====================================================
        // Account Activity
        // ====================================================

        this.recordAccountMessage(

            message.member

        );

        // ====================================================
        // Message State
        // ====================================================

        const state =
            this.getMessageState(

                guildId,

                userId

            );

        const now =
            Date.now();

        state.messages.push({

            content:
                this.normalizeMessage(
                    content
                ),

            channelId:
                message.channel.id,

            timestamp:
                now

        });

        this.cleanupMessageState(

            state,

            now

        );

        // ====================================================
        // Detection
        // ====================================================

        const spamCount =
            this.countRepeatedMessages(

                state,

                content

            );

        const channelCount =
            this.countChannelsForMessage(

                state,

                content

            );

        const messageCount =
            state.messages.length;

        const joinCount =
            this.getJoinCount(

                guildId

            );

        const raid =
            this.detectRaid(

                guildId

            );

        const massSpam =
            this.detectMassSpam(

                guildId

            );

        const account =
            this.getAccountRisk(

                message.member

            );

        // ====================================================
        // Policy Decision
        // ====================================================

        const decision =
            this.evaluate({

                guildId,

                spamCount,

                joinCount,

                account,

                raid,

                massSpam,

                attack: false

            });

        // ====================================================
        // Cross-Channel Spam
        // ====================================================

        if (
            config.spamDetection !== false &&
            channelCount >=
                this.getPolicy().spam
                    .repeatedChannelThreshold
        ) {

            if (
                !decision.actions.includes(
                    "warn"
                )
            ) {

                decision.actions.push(

                    "warn"

                );

            }

        }

        // ====================================================
        // Track Violations
        // ====================================================

        const violationCount =
            this.recordViolations(

                guildId,

                userId,

                decision.actions

            );

        // ====================================================
        // Escalation
        // ====================================================

        if (
            violationCount >= 4 &&
            config.automaticTimeouts
        ) {

            if (
                !decision.actions.includes(
                    "timeout"
                )
            ) {

                decision.actions.push(

                    "timeout"

                );

            }

            if (
                config.automaticRoleRemoval &&
                !decision.actions.includes(
                    "remove_roles"
                )
            ) {

                decision.actions.push(

                    "remove_roles"

                );

            }

        }

        // ====================================================
        // Multiple Rule Violations
        // ====================================================

        if (
            violationCount >= 5 &&
            config.automaticBans
        ) {

            if (
                !decision.actions.includes(
                    "ban"
                )
            ) {

                decision.actions.push(

                    "ban"

                );

            }

        }

        // ====================================================
        // Execute
        // ====================================================

        if (
            decision.actions.length
        ) {

            await this.executeDecision({

                message,

                decision

            });

        }

        return {

            ...decision,

            spamCount,

            channelCount,

            messageCount,

            violationCount,

            account,

            raid,

            massSpam

        };

    }

    // ========================================================
    // Message State
    // ========================================================

    getMessageState(

        guildId,

        userId

    ) {

        const key =
            `${guildId}:${userId}`;

        if (
            !this.messageTracker.has(
                key
            )
        ) {

            this.messageTracker.set(

                key,

                {

                    messages: []

                }

            );

        }

        return this.messageTracker.get(

            key

        );

    }

    cleanupMessageState(

        state,

        now = Date.now()

    ) {

        const window =
            60 * 1000;

        state.messages =
            state.messages.filter(

                item =>

                    now -
                    item.timestamp <=
                    window

            );

    }

    normalizeMessage(content) {

        return String(

            content ?? ""

        )

            .toLowerCase()

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    }

    countRepeatedMessages(

        state,

        content

    ) {

        const normalized =
            this.normalizeMessage(

                content

            );

        return state.messages.filter(

            item =>
                item.content ===
                normalized

        ).length;

    }

    countChannelsForMessage(

        state,

        content

    ) {

        const normalized =
            this.normalizeMessage(

                content

            );

        const channels =
            new Set();

        for (

            const item

            of state.messages

        ) {

            if (
                item.content ===
                normalized
            ) {

                channels.add(

                    item.channelId

                );

            }

        }

        return channels.size;

    }

    // ========================================================
    // Member Join Tracking
    // ========================================================

    async processMemberJoin(member) {

        if (
            !this.monitoring ||
            !member?.guild
        ) {

            return null;

        }

        const guildId =
            member.guild.id;

        const now =
            Date.now();

        if (
            !this.joinTracker.has(
                guildId
            )
        ) {

            this.joinTracker.set(

                guildId,

                []

            );

        }

        const joins =
            this.joinTracker.get(

                guildId

            );

        joins.push({

            userId:
                member.id,

            timestamp:
                now

        });

        this.cleanupJoinState(

            guildId,

            now

        );

        this.recordAccountJoin(

            member

        );

        const account =
            this.getAccountRisk(

                member

            );

        const joinCount =
            this.getJoinCount(

                guildId

            );

        const raid =
            this.detectRaid(

                guildId

            );

        const decision =
            this.evaluate({

                guildId,

                joinCount,

                account,

                raid

            });

        if (
            decision.actions.length
        ) {

            await this.executeMemberDecision({

                member,

                decision

            });

        }

        return decision;

    }

    async processMemberLeave(member) {

        if (!member?.guild) {

            return null;

        }

        const guildId =
            member.guild.id;

        this.accountTracker.delete(

            `${guildId}:${member.id}`

        );

        return true;

    }

    // ========================================================
    // Join State
    // ========================================================

    cleanupJoinState(

        guildId,

        now = Date.now()

    ) {

        const joins =
            this.joinTracker.get(

                guildId

            );

        if (!joins) {

            return;

        }

        const policy =
            this.getPolicy();

        const window =
            policy.raid
                .joinWindowSeconds *
            1000;

        const filtered =
            joins.filter(

                item =>

                    now -
                    item.timestamp <=
                    window

            );

        this.joinTracker.set(

            guildId,

            filtered

        );

    }

    getJoinCount(guildId) {

        return (

            this.joinTracker.get(

                guildId

            )?.length ?? 0

        );

    }

    // ========================================================
    // Raid Detection
    // ========================================================

    detectRaid(guildId) {

        const policy =
            this.getPolicy();

        return aiPolicy.isRaid(

            this.getJoinCount(

                guildId

            ),

            policy

        );

    }

    // ========================================================
    // Mass Spam Detection
    // ========================================================

    detectMassSpam(guildId) {

        const policy =
            this.getPolicy();

        let total = 0;

        const prefix =
            `${guildId}:`;

        for (

            const [

                key,

                state

            ]

            of this.messageTracker

        ) {

            if (
                !key.startsWith(
                    prefix
                )
            ) {

                continue;

            }

            total +=
                state.messages.length;

        }

        return (

            total >=
            policy.raid.messageThreshold

        );

    }

    // ========================================================
    // Account Tracking
    // ========================================================

    getAccountState(member) {

        if (!member?.guild) {

            return null;

        }

        const key =
            `${member.guild.id}:${member.id}`;

        if (
            !this.accountTracker.has(
                key
            )
        ) {

            this.accountTracker.set(

                key,

                {

                    messages: 0,

                    joins: 0,

                    started:
                        Date.now()

                }

            );

        }

        return this.accountTracker.get(

            key

        );

    }

    recordAccountMessage(member) {

        const state =
            this.getAccountState(

                member

            );

        if (!state) {

            return;

        }

        state.messages++;

    }

    recordAccountJoin(member) {

        const state =
            this.getAccountState(

                member

            );

        if (!state) {

            return;

        }

        state.joins++;

    }

    getAccountRisk(member) {

        if (!member?.user) {

            return {};

        }

        const now =
            Date.now();

        const created =
            member.user.createdTimestamp;

        const ageDays =
            Math.max(

                0,

                (

                    now -
                    created

                ) / 86400000

            );

        const state =
            this.getAccountState(

                member

            ) ?? {

                messages: 0,

                joins: 0,

                started: now

            };

        const elapsed =
            Math.max(

                1,

                now -
                state.started

            );

        const minutes =
            elapsed /
            60000;

        return {

            accountAgeDays:
                ageDays,

            messageRate:
                state.messages /
                minutes,

            joinRate:
                state.joins /
                minutes

        };

    }

    // ========================================================
    // Violation Tracking
    // ========================================================

    getViolationState(

        guildId,

        userId

    ) {

        const key =
            `${guildId}:${userId}`;

        if (
            !this.violationTracker.has(
                key
            )
        ) {

            this.violationTracker.set(

                key,

                {

                    count: 0,

                    actions: [],

                    lastViolation: 0

                }

            );

        }

        return this.violationTracker.get(

            key

        );

    }

    recordViolations(

        guildId,

        userId,

        actions = []

    ) {

        const state =
            this.getViolationState(

                guildId,

                userId

            );

        const moderationActions = [

            "warn",

            "timeout",

            "remove_roles",

            "ban"

        ];

        const violations =
            actions.filter(

                action =>
                    moderationActions.includes(
                        action
                    )

            );

        if (
            violations.length
        ) {

            state.count +=
                violations.length;

            state.actions.push(

                ...violations

            );

            state.lastViolation =
                Date.now();

        }

        return state.count;

    }

    // ========================================================
    // Decision Execution
    // ========================================================

    async executeDecision({

        message,

        decision

    }) {

        if (!message?.member) {

            return false;

        }

        for (

            const action

            of decision.actions

        ) {

            await this.executeAction(

                action,

                {

                    message,

                    member:
                        message.member,

                    guild:
                        message.guild,

                    channel:
                        message.channel,

                    decision

                }

            );

        }

        return true;

    }

    async executeMemberDecision({

        member,

        decision

    }) {

        for (

            const action

            of decision.actions

        ) {

            await this.executeAction(

                action,

                {

                    member,

                    guild:
                        member.guild,

                    decision

                }

            );

        }

        return true;

    }

    async executeAction(

        action,

        context = {}

    ) {

        const toolMap = {

            warn:
                "moderation",

            timeout:
                "moderation",

            remove_roles:
                "roles",

            ban:
                "moderation",

            flag_account:
                "security",

            raid_alert:
                "security",

            mass_spam_alert:
                "security",

            critical_alert:
                "security",

            lockdown:
                "security",

            notify_moderators:
                "logging",

            notify_administrators:
                "logging"

        };

        const toolName =
            toolMap[action];

        if (!toolName) {

            return false;

        }

        return this.executeTool(

            {

                name:
                    toolName,

                action,

                context

            },

            context

        );

    }

    // ========================================================
    // Threat State
    // ========================================================

    setThreat(

        guildId,

        threat

    ) {

        this.activeThreats.set(

            guildId,

            {

                ...threat,

                timestamp:
                    Date.now()

            }

        );

        return true;

    }

    getThreat(guildId) {

        return (

            this.activeThreats.get(

                guildId

            ) ?? null

        );

    }

    clearThreat(guildId) {

        return this.activeThreats.delete(

            guildId

        );

    }

    // ========================================================
    // Lockdown State
    // ========================================================

    setLockdown(

        guildId,

        state = true

    ) {

        if (state) {

            this.lockdowns.set(

                guildId,

                {

                    enabled: true,

                    timestamp:
                        Date.now()

                }

            );

            return true;

        }

        return this.lockdowns.delete(

            guildId

        );

    }

    isLockedDown(guildId) {

        return Boolean(

            this.lockdowns.get(

                guildId

            )?.enabled

        );

    }

    // ========================================================
    // Status
    // ========================================================

    getStatus() {

        return {

            initialized:
                this.initialized,

            started:
                this.started,

            monitoring:
                this.monitoring,

            serviceReady:
                aiService.isReady(),

            provider:
                aiService.getProvider(),

            trackedUsers:
                this.messageTracker.size,

            trackedGuilds:
                this.joinTracker.size,

            trackedAccounts:
                this.accountTracker.size,

            trackedViolations:
                this.violationTracker.size,

            activeThreats:
                this.activeThreats.size,

            lockdowns:
                this.lockdowns.size,

            stats:
                aiService.getStats()

        };

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        this.stopMonitoring();

        for (

            const timer

            of this.monitoringTimers

        ) {

            clearTimeout(timer);

            clearInterval(timer);

        }

        this.monitoringTimers.clear();

        this.messageTracker.clear();

        this.joinTracker.clear();

        this.accountTracker.clear();

        this.violationTracker.clear();

        this.activeThreats.clear();

        this.lockdowns.clear();

        await aiService.shutdown();

        this.client = null;

        this.initialized = false;

        this.started = false;

    }

}

export default new AICore();