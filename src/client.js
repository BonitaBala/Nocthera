/**
 * ============================================================
 * Nocthera v1.1.0
 * Discord Client
 * ============================================================
 */

import config from "./core/config.js";

import {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
    REST
} from "discord.js";

export default function createClient() {

    const client = new Client({

        intents: [

            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildModeration,
            GatewayIntentBits.GuildExpressions,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildInvites,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.DirectMessageReactions

        ],

        partials: [

            Partials.Channel,
            Partials.Message,
            Partials.Reaction,
            Partials.GuildMember,
            Partials.User

        ],

        allowedMentions: {

            parse: ["users", "roles"],

            repliedUser: false

        },

        failIfNotExists: false

    });

    // =====================================================
    // Discord REST
    // =====================================================

    const discordToken = config.getValue("discord", "token") || "";

    client.rest = new REST({ version: "10" }).setToken(
        discordToken
    );

    // =====================================================
    // Collections
    // =====================================================

    client.commands = new Collection();

    client.applicationCommands = [];

    client.contextMenus = new Collection();

    client.cooldowns = new Collection();

    client.buttons = new Collection();

    client.selectMenus = new Collection();

    client.modals = new Collection();

    client.events = new Collection();

    client.modules = new Collection();

    client.panels = new Collection();

    client.incidents = new Collection();

    client.cases = new Collection();

    client.tickets = new Collection();

    client.verifications = new Collection();

    client.cacheManager = new Collection();

    // =====================================================
    // Runtime
    // =====================================================

    client.startTime = Date.now();

    client.version = "1.1.0";

    client.codename = "Nora";

    client.development = process.env.NODE_ENV !== "production";

    // =====================================================
    // Statistics
    // =====================================================

    client.stats = {

        commandsLoaded: 0,

        eventsLoaded: 0,

        modulesLoaded: 0,

        guildsProtected: 0,

        incidentsToday: 0

    };

    // =====================================================
    // Settings Cache
    // =====================================================

    client.settings = new Map();

    client.guildConfigs = new Map();

    client.featureFlags = new Map();

    return client;

}