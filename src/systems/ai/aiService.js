/**
 * ============================================================
 * Nocthera v1.1.0
 * Advanced AI Service
 * ============================================================
 *
 * Central AI intelligence layer.
 *
 * Responsibilities:
 * - AI provider management
 * - Guild configuration
 * - Conversations and memory
 * - AI tool definitions
 * - Controlled system bridges
 * - Spam/activity tracking
 * - Moderation decision support
 * - Discord access helpers
 * - AI runtime state
 *
 * IMPORTANT:
 * The AI does not recreate Nocthera systems.
 * It connects to existing systems through controlled bridges.
 * ============================================================
 */

import aiConfig from "./aiConfig.js";
import logger from "../../core/logger.js";

class AIService {

    constructor() {

        // ====================================================
        // Core Runtime
        // ====================================================

        this.client = null;

        this.initialized = false;

        this.started = false;

        // ====================================================
        // AI Provider
        // ====================================================

        this.provider = null;

        this.providerName = null;

        this.model = null;

        // ====================================================
        // Guild Configuration
        // ====================================================

        this.guilds = new Map();

        // ====================================================
        // Conversations
        // ====================================================

        this.conversations = new Map();

        // ====================================================
        // User Memory
        // ====================================================

        this.memory = new Map();

        // ====================================================
        // Token Usage
        // ====================================================

        this.tokens = new Map();

        // ====================================================
        // Cooldowns
        // ====================================================

        this.cooldowns = new Map();

        // ====================================================
        // Active Streams
        // ====================================================

        this.streams = new Map();

        // ====================================================
        // Attachments
        // ====================================================

        this.attachments = new Map();

        // ====================================================
        // User Activity
        // ====================================================

        this.activity = new Map();

        // ====================================================
        // Spam Tracking
        // ====================================================
        //
        // Structure:
        //
        // guildId -> userId -> {
        //     messages: [],
        //     lastMessage: "",
        //     repeatCount: 0
        // }
        //
        // ====================================================

        this.spam = new Map();

        // ====================================================
        // Security Tracking
        // ====================================================

        this.security = new Map();

        // ====================================================
        // Monitoring State
        // ====================================================

        this.monitoring = new Map();

        // ====================================================
        // Pending Actions
        // ====================================================

        this.actions = new Map();

        // ====================================================
        // Statistics
        // ====================================================

        this.stats = {

            requests: 0,

            responses: 0,

            tokens: 0,

            errors: 0,

            toolCalls: 0,

            actions: 0,

            moderationActions: 0,

            securityActions: 0,

            monitoredMessages: 0,

            detectedThreats: 0

        };

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

        await this.loadProvider();

        this.initialized = true;

        logger.success(
            "Advanced AI Service initialized."
        );

        return true;

    }

    // ========================================================
    // Start
    // ========================================================

    async start() {

        if (!this.initialized) {

            throw new Error(
                "AI Service has not been initialized."
            );

        }

        if (this.started) {

            return true;

        }

        this.started = true;

        logger.success(
            "Advanced AI Service started."
        );

        return true;

    }

    // ========================================================
    // Provider Loading
    // ========================================================

    async loadProvider() {

        this.providerName = (

            process.env.AI_PROVIDER ??

            "openai"

        ).toLowerCase();

        switch (this.providerName) {

            case "openai":

                this.provider = {

                    name: "OpenAI",

                    model:
                        process.env.OPENAI_MODEL ??
                        "gpt-5.5"

                };

                this.model =
                    this.provider.model;

                break;

            default:

                throw new Error(

                    `Unsupported AI Provider: ${this.providerName}`

                );

        }

        return this.provider;

    }

    // ========================================================
    // Provider Information
    // ========================================================

    getProvider() {

        return this.provider;

    }

    getProviderName() {

        return this.providerName;

    }

    getModel() {

        return this.model;

    }

    // ========================================================
    // Readiness
    // ========================================================

    isReady() {

        return (

            this.initialized === true &&

            this.client !== null &&

            this.provider !== null

        );

    }

    isStarted() {

        return this.started === true;

    }

    // ========================================================
    // Guild Configuration
    // ========================================================

    getConfig(guildId) {

        if (!guildId) {

            return aiConfig.create();

        }

        if (!this.guilds.has(guildId)) {

            this.guilds.set(

                guildId,

                aiConfig.create()

            );

        }

        return this.guilds.get(guildId);

    }

    setConfig(guildId, config = {}) {

        if (!guildId) {

            throw new Error(
                "Guild ID is required."
            );

        }

        const merged =
            aiConfig.merge(config);

        if (!aiConfig.validate(merged)) {

            throw new Error(
                "Invalid AI configuration."
            );

        }

        this.guilds.set(

            guildId,

            merged

        );

        return merged;

    }

    resetConfig(guildId) {

        if (!guildId) {

            return false;

        }

        this.guilds.set(

            guildId,

            aiConfig.create()

        );

        return true;

    }

    hasGuild(guildId) {

        return this.guilds.has(guildId);

    }

    removeGuild(guildId) {

        if (!guildId) {

            return false;

        }

        this.guilds.delete(guildId);

        this.monitoring.delete(guildId);

        this.security.delete(guildId);

        this.spam.delete(guildId);

        this.actions.delete(guildId);

        return true;

    }

    // ========================================================
    // Statistics
    // ========================================================

    addRequest() {

        this.stats.requests++;

    }

    addResponse() {

        this.stats.responses++;

    }

    addError() {

        this.stats.errors++;

    }

    addToolCall() {

        this.stats.toolCalls++;

    }

    addAction() {

        this.stats.actions++;

    }

    addModerationAction() {

        this.stats.moderationActions++;

    }

    addSecurityAction() {

        this.stats.securityActions++;

    }

    addMonitoredMessage() {

        this.stats.monitoredMessages++;

    }

    addThreat() {

        this.stats.detectedThreats++;

    }

    getStats() {

        return structuredClone(

            this.stats

        );

    }

    resetStats() {

        this.stats = {

            requests: 0,

            responses: 0,

            tokens: 0,

            errors: 0,

            toolCalls: 0,

            actions: 0,

            moderationActions: 0,

            securityActions: 0,

            monitoredMessages: 0,

            detectedThreats: 0

        };

    }

    // ========================================================
    // Token Tracking
    // ========================================================

    addTokens(userId, amount = 0) {

        if (!userId) {

            return 0;

        }

        const value =
            Number(amount);

        if (
            !Number.isFinite(value) ||
            value < 0
        ) {

            return this.getTokens(userId);

        }

        const current =
            this.tokens.get(userId) ?? 0;

        const total =
            current + value;

        this.tokens.set(

            userId,

            total

        );

        this.stats.tokens += value;

        return total;

    }

    getTokens(userId) {

        return (

            this.tokens.get(userId) ?? 0

        );

    }

    resetTokens(userId) {

        if (!userId) {

            return false;

        }

        return this.tokens.delete(userId);

    }

    // ========================================================
    // Cooldowns
    // ========================================================

    onCooldown(userId) {

        if (!userId) {

            return false;

        }

        const expires =
            this.cooldowns.get(userId);

        if (!expires) {

            return false;

        }

        if (Date.now() >= expires) {

            this.cooldowns.delete(userId);

            return false;

        }

        return true;

    }

    getCooldown(userId) {

        if (!userId) {

            return 0;

        }

        const expires =
            this.cooldowns.get(userId);

        if (!expires) {

            return 0;

        }

        const remaining =
            expires - Date.now();

        if (remaining <= 0) {

            this.cooldowns.delete(userId);

            return 0;

        }

        return remaining;

    }

    setCooldown(
        userId,
        seconds = 5
    ) {

        if (!userId) {

            return false;

        }

        const duration = Math.max(

            0,

            Number(seconds) || 0

        );

        this.cooldowns.set(

            userId,

            Date.now() +
            (duration * 1000)

        );

        return true;

    }

    clearCooldown(userId) {

        return this.cooldowns.delete(

            userId

        );

    }

    // ========================================================
    // Runtime State
    // ========================================================

    getRuntimeState() {

        return {

            initialized:
                this.initialized,

            started:
                this.started,

            provider:
                this.providerName,

            model:
                this.model,

            guilds:
                this.guilds.size,

            conversations:
                this.conversations.size,

            memory:
                this.memory.size,

            activeStreams:
                this.streams.size,

            monitoring:
                this.monitoring.size

        };

    }

         // ========================================================
    // Conversation Management
    // ========================================================

    getConversation(id) {

        if (!id) {

            return [];

        }

        if (!this.conversations.has(id)) {

            this.conversations.set(

                id,

                []

            );

        }

        return this.conversations.get(id);

    }

    startConversation(id) {

        return this.getConversation(id);

    }

    hasConversation(id) {

        return this.conversations.has(id);

    }

    endConversation(id) {

        if (!id) {

            return false;

        }

        return this.conversations.delete(id);

    }

    clearConversation(id) {

        return this.endConversation(id);

    }

    conversationLength(id) {

        return this.getConversation(id).length;

    }

    // ========================================================
    // Conversation Messages
    // ========================================================

    appendMessage(

        id,

        role,

        content

    ) {

        if (!id || !role) {

            return null;

        }

        const history =

            this.getConversation(id);

        const message = {

            role,

            content:
                String(content ?? ""),

            timestamp:
                Date.now()

        };

        history.push(message);

        return message;

    }

    appendUserMessage(

        id,

        content

    ) {

        return this.appendMessage(

            id,

            "user",

            content

        );

    }

    appendAssistantMessage(

        id,

        content

    ) {

        return this.appendMessage(

            id,

            "assistant",

            content

        );

    }

    appendSystemMessage(

        id,

        content

    ) {

        return this.appendMessage(

            id,

            "system",

            content

        );

    }

    // ========================================================
    // Conversation History
    // ========================================================

    getHistory(id) {

        return this.getConversation(id);

    }

    trimHistory(

        id,

        limit = 20

    ) {

        const history =

            this.getConversation(id);

        const safeLimit = Math.max(

            1,

            Number(limit) || 20

        );

        if (

            history.length <=

            safeLimit

        ) {

            return history;

        }

        history.splice(

            0,

            history.length -

            safeLimit

        );

        return history;

    }

    resetConversation(id) {

        return this.clearConversation(id);

    }

    // ========================================================
    // User Memory
    // ========================================================

    getMemory(userId) {

        if (!userId) {

            return [];

        }

        if (!this.memory.has(userId)) {

            this.memory.set(

                userId,

                []

            );

        }

        return this.memory.get(userId);

    }

    saveMemory(

        userId,

        memory,

        guildId = null

    ) {

        if (!userId) {

            return null;

        }

        const list =

            this.getMemory(userId);

        list.push({

            content:
                String(memory ?? ""),

            timestamp:
                Date.now()

        });

        const limit =

            this.getMemoryLimit(

                guildId

            );

        if (list.length > limit) {

            list.splice(

                0,

                list.length - limit

            );

        }

        return list.at(-1);

    }

    getMemoryLimit(

        guildId = null

    ) {

        const config =

            guildId

                ? this.getConfig(guildId)

                : aiConfig.create();

        return Math.max(

            1,

            Number(

                config.memoryLimit

            ) || 25

        );

    }

    clearMemory(userId) {

        if (!userId) {

            return false;

        }

        return this.memory.delete(

            userId

        );

    }

    hasMemory(userId) {

        return (

            this.memory.has(userId) &&

            this.memory.get(userId).length > 0

        );

    }

    // ========================================================
    // Context Builder
    // ========================================================

    buildContext(

        guildId,

        userId,

        prompt

    ) {

        const config =

            this.getConfig(guildId);

        const messages = [];

        // ----------------------------------------------------
        // System Prompt
        // ----------------------------------------------------

        if (config.systemPrompt) {

            messages.push({

                role: "system",

                content:
                    config.systemPrompt

            });

        }

        // ----------------------------------------------------
        // Memory
        // ----------------------------------------------------

        if (config.allowMemory) {

            const memory =

                this.getMemory(userId);

            const memoryLimit =

                Math.max(

                    1,

                    Number(

                        config.memoryLimit

                    ) || 25

                );

            const recentMemory =

                memory.slice(

                    -memoryLimit

                );

            for (

                const item

                of recentMemory

            ) {

                const content =

                    typeof item === "object"

                        ? item.content

                        : item;

                if (!content) {

                    continue;

                }

                messages.push({

                    role: "system",

                    content:
                        `Memory: ${content}`

                });

            }

        }

        // ----------------------------------------------------
        // Conversation History
        // ----------------------------------------------------

        const history =

            this.getHistory(userId);

        const contextLimit =

            Math.max(

                1,

                Number(

                    config.contextMessages

                ) || 20

            );

        for (

            const message

            of history.slice(

                -contextLimit

            )

        ) {

            if (

                !message?.role ||

                message.content == null

            ) {

                continue;

            }

            messages.push({

                role:
                    message.role,

                content:
                    String(

                        message.content

                    )

            });

        }

        // ----------------------------------------------------
        // Current Prompt
        // ----------------------------------------------------

        if (

            prompt !== undefined &&

            prompt !== null

        ) {

            messages.push({

                role: "user",

                content:
                    String(prompt)

            });

        }

        return messages;

    }

    // ========================================================
    // Context Management
    // ========================================================

    buildConversationContext(

        guildId,

        userId

    ) {

        const config =

            this.getConfig(guildId);

        const history =

            this.getHistory(userId);

        const limit =

            Math.max(

                1,

                Number(

                    config.contextMessages

                ) || 20

            );

        return history.slice(

            -limit

        );

    }

    clearContext(userId) {

        return this.clearConversation(

            userId

        );

    }

    // ========================================================
    // Chat Preparation
    // ========================================================

    prepareChat(

        guildId,

        userId,

        prompt

    ) {

        if (!guildId) {

            throw new Error(

                "Guild ID is required."

            );

        }

        if (!userId) {

            throw new Error(

                "User ID is required."

            );

        }

        if (

            prompt === undefined ||

            prompt === null ||

            String(prompt).trim() === ""

        ) {

            throw new Error(

                "AI prompt is required."

            );

        }

        const config =

            this.getConfig(guildId);

        if (!config.enabled) {

            throw new Error(

                "AI is disabled."

            );

        }

        return {

            guildId,

            userId,

            prompt:
                String(prompt),

            config,

            messages:
                this.buildContext(

                    guildId,

                    userId,

                    prompt

                )

        };

    }

    // ========================================================
    // Activity Tracking
    // ========================================================

    getActivity(

        guildId,

        userId

    ) {

        if (!guildId || !userId) {

            return null;

        }

        if (!this.activity.has(guildId)) {

            this.activity.set(

                guildId,

                new Map()

            );

        }

        const guildActivity =

            this.activity.get(guildId);

        if (!guildActivity.has(userId)) {

            guildActivity.set(

                userId,

                {

                    messages: 0,

                    lastMessageAt: 0,

                    firstMessageAt: Date.now(),

                    recentMessages: []

                }

            );

        }

        return guildActivity.get(userId);

    }

    recordActivity(

        guildId,

        userId,

        content

    ) {

        const activity =

            this.getActivity(

                guildId,

                userId

            );

        if (!activity) {

            return null;

        }

        const now = Date.now();

        activity.messages++;

        activity.lastMessageAt = now;

        activity.recentMessages.push({

            content:
                String(content ?? ""),

            timestamp:
                now

        });

        if (

            activity.recentMessages.length >

            20

        ) {

            activity.recentMessages.splice(

                0,

                activity.recentMessages.length - 20

            );

        }

        return activity;

    }

    clearActivity(

        guildId,

        userId

    ) {

        if (

            !guildId ||

            !userId ||

            !this.activity.has(guildId)

        ) {

            return false;

        }

        const guildActivity =

            this.activity.get(guildId);

        return guildActivity.delete(

            userId

        );

    }

    // ========================================================
    // Message Normalization
    // ========================================================

    normalizeMessage(content) {

        return String(

            content ?? ""

        )

            .trim()

            .replace(/\s+/g, " ")

            .toLowerCase();

    }

    // ========================================================
    // Spam State
    // ========================================================

    getSpamUserState(

        guildId,

        userId

    ) {

        if (!guildId || !userId) {

            return null;

        }

        if (!this.spam.has(guildId)) {

            this.spam.set(

                guildId,

                new Map()

            );

        }

        const guildSpam =

            this.spam.get(guildId);

        if (!guildSpam.has(userId)) {

            guildSpam.set(

                userId,

                {

                    messages: [],

                    lastMessage: "",

                    repeatCount: 0,

                    violations: 0,

                    warned: false,

                    timedOut: false

                }

            );

        }

        return guildSpam.get(userId);

    }

    // ========================================================
    // Record Message For Spam Detection
    // ========================================================

    recordSpamMessage(

        guildId,

        userId,

        content

    ) {

        const state =

            this.getSpamUserState(

                guildId,

                userId

            );

        if (!state) {

            return null;

        }

        const normalized =

            this.normalizeMessage(

                content

            );

        const now = Date.now();

        state.messages.push({

            content: normalized,

            timestamp: now

        });

        if (

            state.messages.length >

            20

        ) {

            state.messages.splice(

                0,

                state.messages.length - 20

            );

        }

        if (

            normalized &&

            normalized === state.lastMessage

        ) {

            state.repeatCount++;

        } else {

            state.repeatCount = 1;

        }

        state.lastMessage = normalized;

        if (state.repeatCount >= 3) {

            state.violations++;

        }

        return {

            repeatCount:
                state.repeatCount,

            violations:
                state.violations,

            warned:
                state.warned,

            timedOut:
                state.timedOut

        };

    }

         // ========================================================
    // Conversation Messages
    // ========================================================

    appendMessage(

        id,

        role,

        content

    ) {

        if (!id || !role) {

            return null;

        }

        const history =

            this.getConversation(id);

        const message = {

            role,

            content:

                String(content ?? ""),

            timestamp:

                Date.now()

        };

        history.push(message);

        return message;

    }

    appendUserMessage(

        id,

        content

    ) {

        return this.appendMessage(

            id,

            "user",

            content

        );

    }

    appendAssistantMessage(

        id,

        content

    ) {

        return this.appendMessage(

            id,

            "assistant",

            content

        );

    }

    appendSystemMessage(

        id,

        content

    ) {

        return this.appendMessage(

            id,

            "system",

            content

        );

    }

    // ========================================================
    // Conversation History
    // ========================================================

    getHistory(id) {

        return this.getConversation(id);

    }

    trimHistory(

        id,

        limit = 20

    ) {

        const history =

            this.getConversation(id);

        const safeLimit = Math.max(

            1,

            Number(limit) || 20

        );

        if (

            history.length <=

            safeLimit

        ) {

            return history;

        }

        history.splice(

            0,

            history.length -

            safeLimit

        );

        return history;

    }

    resetConversation(id) {

        return this.clearConversation(id);

    }

    // ========================================================
    // User Memory
    // ========================================================

    getMemory(userId) {

        if (!userId) {

            return [];

        }

        if (!this.memory.has(userId)) {

            this.memory.set(

                userId,

                []

            );

        }

        return this.memory.get(userId);

    }

    saveMemory(

        userId,

        memory

    ) {

        if (!userId) {

            return null;

        }

        const list =

            this.getMemory(userId);

        list.push({

            content:

                String(memory ?? ""),

            timestamp:

                Date.now()

        });

        const limit =

            this.getMemoryLimit();

        if (list.length > limit) {

            list.splice(

                0,

                list.length - limit

            );

        }

        return list.at(-1);

    }

    getMemoryLimit(guildId = null) {

        const config = guildId

            ? this.getConfig(guildId)

            : aiConfig.create();

        return Math.max(

            1,

            Number(config.memoryLimit) || 25

        );

    }

    clearMemory(userId) {

        if (!userId) {

            return false;

        }

        return this.memory.delete(

            userId

        );

    }

    hasMemory(userId) {

        return (

            this.memory.has(userId) &&

            this.memory.get(userId).length > 0

        );

    }

    // ========================================================
    // Context Builder
    // ========================================================

    buildContext(

        guildId,

        userId,

        prompt

    ) {

        const config =

            this.getConfig(guildId);

        const messages = [];

        // ----------------------------------------------------
        // System Prompt
        // ----------------------------------------------------

        if (config.systemPrompt) {

            messages.push({

                role: "system",

                content:

                    config.systemPrompt

            });

        }

        // ----------------------------------------------------
        // Memory
        // ----------------------------------------------------

        if (config.allowMemory) {

            const memory =

                this.getMemory(userId);

            const memoryLimit =

                Math.max(

                    1,

                    Number(

                        config.memoryLimit

                    ) || 25

                );

            const recentMemory =

                memory.slice(

                    -memoryLimit

                );

            for (

                const item

                of recentMemory

            ) {

                const content =

                    typeof item === "object"

                        ? item.content

                        : item;

                if (!content) {

                    continue;

                }

                messages.push({

                    role: "system",

                    content:

                        `Memory: ${content}`

                });

            }

        }

        // ----------------------------------------------------
        // Conversation History
        // ----------------------------------------------------

        const history =

            this.getHistory(userId);

        const contextLimit =

            Math.max(

                1,

                Number(

                    config.contextMessages

                ) || 20

            );

        for (

            const message

            of history.slice(

                -contextLimit

            )

        ) {

            if (

                !message?.role ||

                message.content == null

            ) {

                continue;

            }

            messages.push({

                role:

                    message.role,

                content:

                    String(

                        message.content

                    )

            });

        }

        // ----------------------------------------------------
        // Current User Prompt
        // ----------------------------------------------------

        if (

            prompt !== undefined &&

            prompt !== null

        ) {

            messages.push({

                role: "user",

                content:

                    String(prompt)

            });

        }

        return messages;

    }

    // ========================================================
    // Context Management
    // ========================================================

    buildConversationContext(

        guildId,

        userId

    ) {

        const config =

            this.getConfig(guildId);

        const history =

            this.getHistory(userId);

        const limit =

            Math.max(

                1,

                Number(

                    config.contextMessages

                ) || 20

            );

        return history.slice(

            -limit

        );

    }

    clearContext(userId) {

        return this.clearConversation(

            userId

        );

    }

    // ========================================================
    // Chat State
    // ========================================================

    prepareChat(

        guildId,

        userId,

        prompt

    ) {

        if (!guildId) {

            throw new Error(

                "Guild ID is required."

            );

        }

        if (!userId) {

            throw new Error(

                "User ID is required."

            );

        }

        if (

            prompt === undefined ||

            prompt === null ||

            String(prompt).trim() === ""

        ) {

            throw new Error(

                "AI prompt is required."

            );

        }

        const config =

            this.getConfig(guildId);

        if (!config.enabled) {

            throw new Error(

                "AI is disabled."

            );

        }

        return {

            guildId,

            userId,

            prompt:

                String(prompt),

            config,

            messages:

                this.buildContext(

                    guildId,

                    userId,

                    prompt

                )

        };

    }

         // ========================================================
    // Chat
    // ========================================================

    async chat({

        guildId,

        userId,

        prompt,

        attachments = []

    }) {

        this.stats.requests++;

        const prepared = this.prepareChat(

            guildId,

            userId,

            prompt

        );

        const {

            config,

            messages

        } = prepared;

        if (

            this.onCooldown(userId)

        ) {

            throw new Error(

                "User is on cooldown."

            );

        }

        this.setCooldown(

            userId,

            config.cooldown

        );

        try {

            const response =

                await this.generate(

                    messages,

                    attachments,

                    {

                        guildId,

                        userId,

                        prompt

                    }

                );

            if (!response) {

                throw new Error(

                    "AI provider returned no response."

                );

            }

            const content =

                String(

                    response.content ?? ""

                );

            this.appendUserMessage(

                userId,

                prompt

            );

            this.appendAssistantMessage(

                userId,

                content

            );

            this.trimHistory(

                userId,

                config.maxHistory

            );

            this.addTokens(

                userId,

                response.tokens ?? 0

            );

            this.stats.responses++;

            return {

                content,

                tokens:

                    response.tokens ?? 0,

                model:

                    response.model ??

                    this.model,

                finishReason:

                    response.finishReason ??

                    null,

                toolCalls:

                    response.toolCalls ??

                    [],

                usage:

                    response.usage ??

                    null

            };

        }

        catch (error) {

            this.stats.errors++;

            throw error;

        }

    }

    // ========================================================
    // Generate
    // ========================================================

    async generate(

        messages,

        attachments = [],

        context = {}

    ) {

        if (!this.isReady()) {

            throw new Error(

                "AI Service is not ready."

            );

        }

        if (!Array.isArray(messages)) {

            throw new TypeError(

                "AI messages must be an array."

            );

        }

        switch (this.providerName) {

            case "openai":

                return this.generateOpenAI(

                    messages,

                    attachments,

                    context

                );

            default:

                throw new Error(

                    `Unknown AI provider: ${this.providerName}`

                );

        }

    }

    // ========================================================
    // OpenAI Generation
    // ========================================================

    async generateOpenAI(

        messages,

        attachments = [],

        context = {}

    ) {

        const config =

            this.getConfig(

                context.guildId

            );

        const client =

            this.getOpenAIClient();

        if (!client) {

            throw new Error(

                "OpenAI client is not available."

            );

        }

        const input =

            this.buildOpenAIInput(

                messages,

                attachments

            );

        const tools =

            this.getAvailableTools(

                context

            );

        const request = {

            model:

                config.model ||

                this.model ||

                "gpt-5.5",

            input,

            temperature:

                config.temperature,

            max_output_tokens:

                config.maxTokens

        };

        if (tools.length > 0) {

            request.tools = tools;

        }

        const response =

            await client.responses.create(

                request

            );

        return this.parseOpenAIResponse(

            response

        );

    }

    // ========================================================
    // OpenAI Client
    // ========================================================

    getOpenAIClient() {

        if (

            this.provider?.client

        ) {

            return this.provider.client;

        }

        if (

            this.client?.openai

        ) {

            return this.client.openai;

        }

        if (

            globalThis.noctheraOpenAI

        ) {

            return globalThis.noctheraOpenAI;

        }

        return null;

    }

    // ========================================================
    // OpenAI Input Builder
    // ========================================================

    buildOpenAIInput(

        messages,

        attachments = []

    ) {

        const input = [];

        for (

            const message

            of messages

        ) {

            if (!message?.role) {

                continue;

            }

            input.push({

                role:

                    message.role,

                content:

                    message.content ?? ""

            });

        }

        if (

            Array.isArray(attachments) &&

            attachments.length > 0

        ) {

            const attachmentInput =

                this.buildAttachmentInput(

                    attachments

                );

            if (

                attachmentInput.length > 0

            ) {

                input.push({

                    role: "user",

                    content:

                        attachmentInput

                });

            }

        }

        return input;

    }

    // ========================================================
    // Attachment Input
    // ========================================================

    buildAttachmentInput(

        attachments = []

    ) {

        if (!Array.isArray(attachments)) {

            return [];

        }

        const content = [];

        for (

            const attachment

            of attachments

        ) {

            if (!attachment) {

                continue;

            }

            const url =

                attachment.url ??

                attachment.proxyURL ??

                attachment.proxyUrl;

            const contentType =

                attachment.contentType ??

                "";

            if (

                contentType.startsWith(

                    "image/"

                ) &&

                url

            ) {

                content.push({

                    type:

                        "input_image",

                    image_url:

                        url

                });

                continue;

            }

            if (url) {

                content.push({

                    type:

                        "input_text",

                    text:

                        `Attachment: ${

                            attachment.name ??

                            "unknown"

                        }\n${url}`

                });

            }

        }

        return content;

    }

    // ========================================================
    // OpenAI Response Parser
    // ========================================================

    parseOpenAIResponse(

        response

    ) {

        if (!response) {

            throw new Error(

                "Empty OpenAI response."

            );

        }

        let content = "";

        if (

            typeof response.output_text ===

            "string"

        ) {

            content =

                response.output_text;

        }

        if (

            !content &&

            Array.isArray(response.output)

        ) {

            for (

                const item

                of response.output

            ) {

                if (

                    item?.type ===

                    "message" &&

                    Array.isArray(

                        item.content

                    )

                ) {

                    for (

                        const part

                        of item.content

                    ) {

                        if (

                            part?.type ===

                            "output_text"

                        ) {

                            content +=

                                part.text ?? "";

                        }

                    }

                }

            }

        }

        const usage =

            response.usage ?? {};

        const tokens =

            Number(

                usage.total_tokens ??

                (

                    Number(

                        usage.input_tokens

                    ) || 0

                ) +

                (

                    Number(

                        usage.output_tokens

                    ) || 0

                )

            );

        const toolCalls =

            Array.isArray(

                response.output

            )

                ? response.output.filter(

                    item =>

                        item?.type ===

                        "function_call"

                )

                : [];

        return {

            content,

            tokens:

                Number.isFinite(tokens)

                    ? tokens

                    : 0,

            model:

                response.model ??

                this.model,

            finishReason:

                response.status ??

                null,

            toolCalls,

            usage

        };

    }

         // ========================================================
    // Available AI Tools
    // ========================================================

    getAvailableTools(

        context = {}

    ) {

        const tools = [];

        const config =

            this.getConfig(

                context.guildId

            );

        if (!config.enabled) {

            return tools;

        }

        tools.push(

            ...this.getSystemToolDefinitions()

        );

        tools.push(

            ...this.getSecurityToolDefinitions()

        );

        tools.push(

            ...this.getAutomationToolDefinitions()

        );

        return tools;

    }

    // ========================================================
    // System Tool Definitions
    // ========================================================

    getSystemToolDefinitions() {

        return [

            {

                type: "function",

                name: "security",

                description:

                    "Access Nocthera's existing Security system.",

                parameters: {

                    type: "object",

                    properties: {

                        action: {

                            type: "string"

                        },

                        reason: {

                            type: "string"

                        },

                        userId: {

                            type: "string"

                        }

                    },

                    required: [

                        "action"

                    ]

                }

            },

            {

                type: "function",

                name: "moderation",

                description:

                    "Access Nocthera's existing Moderation system.",

                parameters: {

                    type: "object",

                    properties: {

                        action: {

                            type: "string"

                        },

                        userId: {

                            type: "string"

                        },

                        reason: {

                            type: "string"

                        }

                    },

                    required: [

                        "action"

                    ]

                }

            },

            {

                type: "function",

                name: "roles",

                description:

                    "Access Nocthera's existing Roles system.",

                parameters: {

                    type: "object",

                    properties: {

                        action: {

                            type: "string"

                        },

                        userId: {

                            type: "string"

                        },

                        roleId: {

                            type: "string"

                        }

                    },

                    required: [

                        "action"

                    ]

                }

            },

            {

                type: "function",

                name: "verification",

                description:

                    "Access Nocthera's existing Verification system.",

                parameters: {

                    type: "object",

                    properties: {

                        action: {

                            type: "string"

                        },

                        userId: {

                            type: "string"

                        }

                    },

                    required: [

                        "action"

                    ]

                }

            },

            {

                type: "function",

                name: "logging",

                description:

                    "Access Nocthera's existing Logging system.",

                parameters: {

                    type: "object",

                    properties: {

                        action: {

                            type: "string"

                        },

                        message: {

                            type: "string"

                        }

                    },

                    required: [

                        "action"

                    ]

                }

            },

            {

                type: "function",

                name: "tickets",

                description:

                    "Access Nocthera's existing Tickets system.",

                parameters: {

                    type: "object",

                    properties: {

                        action: {

                            type: "string"

                        },

                        userId: {

                            type: "string"

                        },

                        reason: {

                            type: "string"

                        }

                    },

                    required: [

                        "action"

                    ]

                }

            },

            {

                type: "function",

                name: "embeds",

                description:

                    "Access Nocthera's existing Embeds system.",

                parameters: {

                    type: "object",

                    properties: {

                        action: {

                            type: "string"

                        },

                        channelId: {

                            type: "string"

                        },

                        title: {

                            type: "string"

                        },

                        description: {

                            type: "string"

                        }

                    },

                    required: [

                        "action"

                    ]

                }

            }

        ];

    }

    // ========================================================
    // Security Tool Definitions
    // ========================================================

    getSecurityToolDefinitions() {

        const config =

            aiConfig.create();

        if (

            !config.threatDetection &&

            !config.securityMonitoring

        ) {

            return [];

        }

        return [

            {

                type: "function",

                name: "security_scan",

                description:

                    "Analyze a Discord security event using Nocthera's security systems.",

                parameters: {

                    type: "object",

                    properties: {

                        guildId: {

                            type: "string"

                        },

                        userId: {

                            type: "string"

                        },

                        event: {

                            type: "string"

                        },

                        details: {

                            type: "string"

                        }

                    },

                    required: [

                        "event"

                    ]

                }

            }

        ];

    }

    // ========================================================
    // Automation Tool Definitions
    // ========================================================

    getAutomationToolDefinitions() {

        const config =

            aiConfig.create();

        if (!config.autonomousActions) {

            return [];

        }

        return [

            {

                type: "function",

                name: "server",

                description:

                    "Access Nocthera's existing server management system.",

                parameters: {

                    type: "object",

                    properties: {

                        action: {

                            type: "string"

                        },

                        guildId: {

                            type: "string"

                        },

                        userId: {

                            type: "string"

                        },

                        channelId: {

                            type: "string"

                        },

                        roleId: {

                            type: "string"

                        },

                        reason: {

                            type: "string"

                        }

                    },

                    required: [

                        "action"

                    ]

                }

            },

            {

                type: "function",

                name: "community",

                description:

                    "Access Nocthera's existing Community system.",

                parameters: {

                    type: "object",

                    properties: {

                        action: {

                            type: "string"

                        },

                        guildId: {

                            type: "string"

                        },

                        userId: {

                            type: "string"

                        },

                        channelId: {

                            type: "string"

                        },

                        message: {

                            type: "string"

                        }

                    },

                    required: [

                        "action"

                    ]

                }

            },

            {

                type: "function",

                name: "music",

                description:

                    "Access Nocthera's existing Music system.",

                parameters: {

                    type: "object",

                    properties: {

                        action: {

                            type: "string"

                        },

                        guildId: {

                            type: "string"

                        },

                        query: {

                            type: "string"

                        },

                        userId: {

                            type: "string"

                        }

                    },

                    required: [

                        "action"

                    ]

                }

            }

        ];

    }

    // ========================================================
    // Tool Execution
    // ========================================================

    async executeTools(

        tools = [],

        context = {}

    ) {

        if (!Array.isArray(tools)) {

            return [];

        }

        const results = [];

        for (const tool of tools) {

            try {

                const result =

                    await this.executeTool(

                        tool,

                        context

                    );

                results.push(result);

            }

            catch (error) {

                this.addError();

                results.push({

                    success: false,

                    tool:

                        tool?.name ??

                        "unknown",

                    error:

                        error?.message ??

                        String(error)

                });

            }

        }

        return results;

    }

    // ========================================================
    // Execute Single Tool
    // ========================================================

    async executeTool(

        tool,

        context = {}

    ) {

        if (

            !tool ||

            typeof tool !== "object" ||

            !tool.name

        ) {

            return {

                success: false,

                error:

                    "Invalid AI tool."

            };

        }

        this.addToolCall();

        switch (tool.name) {

            case "security":

                return this.executeSecurityTool(

                    tool,

                    context

                );

            case "security_scan":

                return this.executeSecurityScanTool(

                    tool,

                    context

                );

            case "verification":

                return this.executeVerificationTool(

                    tool,

                    context

                );

            case "roles":

                return this.executeRolesTool(

                    tool,

                    context

                );

            case "moderation":

                return this.executeModerationTool(

                    tool,

                    context

                );

            case "logging":

                return this.executeLoggingTool(

                    tool,

                    context

                );

            case "tickets":

                return this.executeTicketsTool(

                    tool,

                    context

                );

            case "community":

                return this.executeCommunityTool(

                    tool,

                    context

                );

            case "embeds":

                return this.executeEmbedTool(

                    tool,

                    context

                );

            case "music":

                return this.executeMusicTool(

                    tool,

                    context

                );

            case "server":

                return this.executeServerTool(

                    tool,

                    context

                );

            default:

                return {

                    success: false,

                    error:

                        `Unknown AI tool: ${tool.name}`

                };

        }

    }

    // ========================================================
    // Security Scan
    // ========================================================

    async executeSecurityScanTool(

        tool,

        context = {}

    ) {

        const guildId =

            tool.guildId ??

            context.guildId;

        const userId =

            tool.userId ??

            context.userId;

        const event =

            tool.event ??

            "unknown";

        const details =

            tool.details ??

            "";

        const result = {

            success: true,

            system: "Security",

            event,

            guildId:

                guildId ?? null,

            userId:

                userId ?? null,

            details

        };

        this.addSecurityAction();

        return result;

    }

    // ========================================================
    // Security System Bridge
    // ========================================================

    async executeSecurityTool(

        tool,

        context = {}

    ) {

        return this.executeSystemBridge(

            "Security",

            tool,

            context

        );

    }

    // ========================================================
    // Verification System Bridge
    // ========================================================

    async executeVerificationTool(

        tool,

        context = {}

    ) {

        return this.executeSystemBridge(

            "Verification",

            tool,

            context

        );

    }

    // ========================================================
    // Roles System Bridge
    // ========================================================

    async executeRolesTool(

        tool,

        context = {}

    ) {

        return this.executeSystemBridge(

            "Roles",

            tool,

            context

        );

    }

    // ========================================================
    // Moderation System Bridge
    // ========================================================

    async executeModerationTool(

        tool,

        context = {}

    ) {

        return this.executeSystemBridge(

            "Moderation",

            tool,

            context

        );

    }

    // ========================================================
    // Logging System Bridge
    // ========================================================

    async executeLoggingTool(

        tool,

        context = {}

    ) {

        return this.executeSystemBridge(

            "Logging",

            tool,

            context

        );

    }

    // ========================================================
    // Tickets System Bridge
    // ========================================================

    async executeTicketsTool(

        tool,

        context = {}

    ) {

        return this.executeSystemBridge(

            "Tickets",

            tool,

            context

        );

    }

    // ========================================================
    // Community System Bridge
    // ========================================================

    async executeCommunityTool(

        tool,

        context = {}

    ) {

        return this.executeSystemBridge(

            "Community",

            tool,

            context

        );

    }

    // ========================================================
    // Embed System Bridge
    // ========================================================

    async executeEmbedTool(

        tool,

        context = {}

    ) {

        return this.executeSystemBridge(

            "Embeds",

            tool,

            context

        );

    }

    // ========================================================
    // Music System Bridge
    // ========================================================

    async executeMusicTool(

        tool,

        context = {}

    ) {

        return this.executeSystemBridge(

            "Music",

            tool,

            context

        );

    }

    // ========================================================
    // Server Control Bridge
    // ========================================================

    async executeServerTool(

        tool,

        context = {}

    ) {

        return this.executeSystemBridge(

            "Server",

            tool,

            context

        );

    }

    // ========================================================
    // System Bridge
    // ========================================================

    async executeSystemBridge(

        system,

        tool,

        context = {}

    ) {

        if (!this.client) {

            return {

                success: false,

                system,

                error:

                    "Discord client is unavailable."

            };

        }

        const result = {

            success: true,

            system,

            action:

                tool.action ??

                null,

            parameters:

                tool.parameters ??

                {},

            context

        };

        if (

            system === "Moderation"

        ) {

            this.addModerationAction();

        }

        if (

            system === "Security"

        ) {

            this.addSecurityAction();

        }

        if (

            system !== "Logging"

        ) {

            this.addAction();

        }

        return result;

    }

         // ========================================================
    // Discord Reply Helpers
    // ========================================================

    async reply(interaction, content) {

        if (!interaction) {

            return null;

        }

        if (

            interaction.replied ||

            interaction.deferred

        ) {

            return interaction.followUp({

                content

            });

        }

        return interaction.reply({

            content

        });

    }

    // ========================================================
    // Discord Embed Reply
    // ========================================================

    async replyEmbed(

        interaction,

        embed

    ) {

        if (!interaction) {

            return null;

        }

        if (

            interaction.replied ||

            interaction.deferred

        ) {

            return interaction.followUp({

                embeds: [embed]

            });

        }

        return interaction.reply({

            embeds: [embed]

        });

    }

    // ========================================================
    // Message Splitting
    // ========================================================

    splitMessage(

        text,

        limit = 1900

    ) {

        if (typeof text !== "string") {

            return [];

        }

        if (

            !Number.isFinite(limit) ||

            limit < 1

        ) {

            limit = 1900;

        }

        if (text.length <= limit) {

            return [text];

        }

        const chunks = [];

        let current = "";

        for (

            const line

            of text.split("\n")

        ) {

            const next =

                current.length +

                line.length +

                1;

            if (

                next > limit &&

                current.length

            ) {

                chunks.push(

                    current.trimEnd()

                );

                current = "";

            }

            // ------------------------------------------------
            // Handle a single line larger than the limit
            // ------------------------------------------------

            if (

                line.length + 1 >

                limit

            ) {

                if (current.length) {

                    chunks.push(

                        current.trimEnd()

                    );

                    current = "";

                }

                let remaining = line;

                while (

                    remaining.length >

                    limit

                ) {

                    chunks.push(

                        remaining.slice(

                            0,

                            limit

                        )

                    );

                    remaining =

                        remaining.slice(

                            limit

                        );

                }

                current =

                    remaining

                    ? `${remaining}\n`

                    : "";

                continue;

            }

            current +=

                `${line}\n`;

        }

        if (current.length) {

            chunks.push(

                current.trimEnd()

            );

        }

        return chunks;

    }

    // ========================================================
    // Typing Indicator
    // ========================================================

    async typing(channel) {

        if (!channel) {

            return false;

        }

        try {

            await channel.sendTyping();

            return true;

        }

        catch {

            return false;

        }

    }

    // ========================================================
    // Permission Check
    // ========================================================

    hasPermission(

        member,

        permission

    ) {

        if (!member?.permissions) {

            return false;

        }

        if (!permission) {

            return false;

        }

        return member.permissions.has(

            permission

        );

    }

    // ========================================================
    // Administrator Check
    // ========================================================

    isAdministrator(member) {

        if (!member?.permissions) {

            return false;

        }

        return member.permissions.has(

            "Administrator"

        );

    }

    // ========================================================
    // Guild Access
    // ========================================================

    getGuild(guildId) {

        if (

            !this.client ||

            !guildId

        ) {

            return null;

        }

        return (

            this.client.guilds.cache.get(

                guildId

            ) ?? null

        );

    }

    // ========================================================
    // Member Access
    // ========================================================

    getMember(

        guildId,

        userId

    ) {

        const guild =

            this.getGuild(

                guildId

            );

        if (

            !guild ||

            !userId

        ) {

            return null;

        }

        return (

            guild.members.cache.get(

                userId

            ) ?? null

        );

    }

    // ========================================================
    // Channel Access
    // ========================================================

    getChannel(channelId) {

        if (

            !this.client ||

            !channelId

        ) {

            return null;

        }

        return (

            this.client.channels.cache.get(

                channelId

            ) ?? null

        );

    }

    // ========================================================
    // Cleanup
    // ========================================================

    cleanup() {

        this.cooldowns.clear();

        this.streams.clear();

        this.attachments.clear();

        this.activity.clear();

        this.spam.clear();

        this.security.clear();

        this.monitoring.clear();

        this.actions.clear();

    }

    // ========================================================
    // Shutdown
    // ========================================================

    async shutdown() {

        this.cleanup();

        this.guilds.clear();

        this.memory.clear();

        this.conversations.clear();

        this.tokens.clear();

        this.client = null;

        this.provider = null;

        this.providerName = null;

        this.model = null;

        this.initialized = false;

        this.started = false;

        return true;

    }

}

// ============================================================
// AI Service Instance
// ============================================================

export default new AIService();