/**
 * ============================================================
 * Nocthera v1.1.0
 * NSFW Handler – panel, category toggles, prefix with modes
 * Sends actual media files (image/gif/video), not embed links
 * ============================================================
 */

import {
    EmbedBuilder,
    MessageFlags,
    PermissionFlagsBits,
    AttachmentBuilder
} from "discord.js";

import nsfwManager from "./nsfwManager.js";
import { listTags } from "./nsfwService.js";
import logger from "../../core/logger.js";
import { createSystemPanel, updateEphemeral } from "../../core/systemPanel.js";

const DISCORD_UPLOAD_MAX = 24 * 1024 * 1024; // ~24MB safe under 25MB limit
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function isNsfwChannel(channel) {
    if (!channel) return false;
    if (channel.nsfw === true) return true;
    if (channel.parent?.nsfw === true) return true;
    return false;
}

async function downloadBuffer(url, extraHeaders = {}) {
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": UA, Accept: "*/*", ...extraHeaders },
            signal: AbortSignal.timeout(20000),
            redirect: "follow"
        });
        if (!res.ok) return null;
        const ab = await res.arrayBuffer();
        const buf = Buffer.from(ab);
        if (!buf.length || buf.length > DISCORD_UPLOAD_MAX) return null;
        return buf;
    } catch (e) {
        logger.warn(`NSFW download failed: ${e?.message}`);
        return null;
    }
}

function extForMedia(image) {
    const type = image.type || "image";
    const url = image.videoUrl || image.url || "";
    if (type === "mp4" || /\.mp4(\?|$)/i.test(url)) return "mp4";
    if (type === "gif" || /\.gif(\?|$)/i.test(url)) return "gif";
    if (/\.webm(\?|$)/i.test(url)) return "webm";
    if (/\.png(\?|$)/i.test(url)) return "png";
    if (/\.webp(\?|$)/i.test(url)) return "webp";
    return "jpg";
}

/**
 * Prefer uploading the real file. If over 24MB / download fails,
 * fall back to an embeddable link (X/Twitter, Redgifs) that Discord unfurls & plays.
 */
async function buildFilePayload(image, tagLabel, author, mode) {
    const modeLabel = mode === "hentai" ? "Hentai" : mode === "3d" ? "3D" : "Real";
    const mediaUrl = image.videoUrl || image.url;
    const caption =
        `🔥 **${tagLabel}** (${modeLabel}) · ${image.source || "nsfw"} · <@${author.id}>`;

    // 1) Try download + attach (images, gifs, small videos)
    if (mediaUrl) {
        const buf = await downloadBuffer(mediaUrl);
        if (buf) {
            const ext = extForMedia(image);
            const filename = `nsfw-${Date.now()}.${ext}`;
            const file = new AttachmentBuilder(buf, { name: filename });
            return { content: caption, files: [file] };
        }
    }

    // 2) Embeddable link fallback — Discord auto-plays these
    const embedLink =
        image.embedUrl ||
        (image.type === "redgif" ? image.url : null) ||
        (image.source?.startsWith("x.com") || image.source?.startsWith("twitter")
            ? image.url
            : null) ||
        (/x\.com\/|twitter\.com\/|redgifs\.com\/watch/i.test(image.url || "")
            ? image.url
            : null) ||
        (/x\.com\/|twitter\.com\/|redgifs\.com\/watch/i.test(image.videoUrl || "")
            ? image.videoUrl
            : null);

    if (embedLink) {
        // Plain content URL → Discord unfurl/player (same as X/Twitter posts)
        return { content: `${caption}\n${embedLink}` };
    }

    // 3) Last resort: any remaining media URL as link
    if (mediaUrl) {
        return { content: `${caption}\n${mediaUrl}` };
    }
    return null;
}

function buildStatusText(cfg) {
    if (!cfg.enabled) {
        return "❌ Disabled — click **Enable** (Manage Server required)";
    }
    const c = cfg.categories || {};
    const real = c.real !== false ? "🟢 Real" : "🔴 Real";
    const hentai = c.hentai !== false ? "🟢 Hentai" : "🔴 Hentai";
    const d3 = c["3d"] !== false ? "🟢 3D" : "🔴 3D";
    const cd = cfg.cooldownSeconds ?? 0;
    const lim = cfg.maxPerHour ?? 0;
    const limText = cd <= 0 && lim <= 0
        ? "Unlimited"
        : `CD ${cd || 0}s / ${lim || "∞"}/h`;
    return `✅ Enabled • ${real} ${hentai} ${d3} • ${limText}`;
}

function buildPanel(cfg) {
    return createSystemPanel({
        name: "NSFW",
        emoji: "🔥",
        description:
            "**Adult media tag system** — NSFW channels only.\n\n" +
            "• `!anal` → Real Life anal\n" +
            "• `!anal hentai` → Hentai anal\n" +
            "• `!pussy 3d` → 3D pussy\n" +
            "• `!bondage anal` → Real bondage + anal\n\n" +
            "Sends **actual image / gif / video files** (not links).",
        status: buildStatusText(cfg),
        buttons: [
            { id: "nsfw:enable", label: "Enable", emoji: "✅", style: 3 },
            { id: "nsfw:disable", label: "Disable", emoji: "🛑", style: 4 },
            { id: "nsfw:status", label: "Status", emoji: "ℹ️", style: 2 },
            { id: "nsfw:tags", label: "All Tags", emoji: "🏷️", style: 1 },
            {
                id: "nsfw:cat:real",
                label: "Real Life",
                emoji: "📷",
                style: cfg.categories?.real !== false ? 3 : 2
            },
            {
                id: "nsfw:cat:hentai",
                label: "Hentai",
                emoji: "🌸",
                style: cfg.categories?.hentai !== false ? 3 : 2
            },
            {
                id: "nsfw:cat:3d",
                label: "3D",
                emoji: "🧊",
                style: cfg.categories?.["3d"] !== false ? 3 : 2
            }
        ]
    });
}

class NsfwHandler {
    async handleInteraction(interaction) {
        if (!interaction?.customId?.startsWith("nsfw:")) return false;

        try {
            if (interaction.isButton()) {
                const parts = interaction.customId.split(":");
                const action = parts[1];

                if (action === "enable") return this.handleEnable(interaction);
                if (action === "disable") return this.handleDisable(interaction);
                if (action === "status") return this.handleStatus(interaction);
                if (action === "tags") return this.handleTags(interaction);
                if (action === "cat" && parts[2]) {
                    return this.handleToggleCategory(interaction, parts[2]);
                }
            }
            return false;
        } catch (error) {
            logger.error(`NSFW interaction error: ${error?.stack ?? error}`);
            if (!interaction.replied && !interaction.deferred) {
                await interaction
                    .reply({
                        content: "❌ Something went wrong with the NSFW system.",
                        flags: MessageFlags.Ephemeral
                    })
                    .catch(() => {});
            }
            return true;
        }
    }

    async handleEnable(interaction) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                content: "❌ You need **Manage Server** to enable the NSFW system.",
                flags: MessageFlags.Ephemeral
            });
        }
        const cfg = await nsfwManager.enable(interaction.guildId, interaction.user.id);
        return updateEphemeral(interaction, buildPanel(cfg));
    }

    async handleDisable(interaction) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                content: "❌ You need **Manage Server** to disable the NSFW system.",
                flags: MessageFlags.Ephemeral
            });
        }
        const cfg = await nsfwManager.disable(interaction.guildId);
        return updateEphemeral(interaction, buildPanel(cfg));
    }

    async handleToggleCategory(interaction, category) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                content: "❌ You need **Manage Server** to toggle categories.",
                flags: MessageFlags.Ephemeral
            });
        }
        const key = category === "3d" ? "3d" : category;
        const cfg = await nsfwManager.toggleCategory(interaction.guildId, key);
        return updateEphemeral(interaction, buildPanel(cfg));
    }

    async handleStatus(interaction) {
        const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
        let cfg = await nsfwManager.getConfig(interaction.guildId);

        if (isAdmin) {
            cfg = await nsfwManager.cycleLimits(interaction.guildId);
            try {
                return updateEphemeral(interaction, buildPanel(cfg));
            } catch { /* fall through */ }
        }

        const c = cfg.categories || {};
        const cd = cfg.cooldownSeconds ?? 0;
        const lim = cfg.maxPerHour ?? 0;
        const limText = cd <= 0 && lim <= 0
            ? "**Unlimited**"
            : `${cd || 0}s cooldown • ${lim || "∞"}/hour`;

        const embed = new EmbedBuilder()
            .setColor(cfg.enabled ? 0x00c853 : 0x757575)
            .setTitle("🔥 NSFW System Status")
            .addFields(
                { name: "System", value: cfg.enabled ? "✅ **Enabled**" : "❌ Disabled", inline: true },
                { name: "Real Life", value: c.real !== false ? "🟢 On" : "🔴 Off", inline: true },
                { name: "Hentai", value: c.hentai !== false ? "🟢 On" : "🔴 Off", inline: true },
                { name: "3D", value: c["3d"] !== false ? "🟢 On" : "🔴 Off", inline: true },
                {
                    name: "Rate Limits",
                    value: limText + (isAdmin ? "\n*(click Status again to cycle)*" : ""),
                    inline: false
                },
                {
                    name: "Usage",
                    value: "`!anal` → Real\n`!anal hentai` → Hentai\n`!anal 3d` → 3D\n`!arab anal` → Real arab+anal"
                },
                {
                    name: "Providers",
                    value: "redditporn • Redgifs • Gifreels • e621 • yande.re • konachan"
                }
            )
            .setFooter({ text: "Only works in NSFW-marked channels • Files uploaded directly" })
            .setTimestamp();

        return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    async handleTags(interaction) {
        const tags = listTags();
        const chunks = [];
        let current = "";
        for (const t of tags) {
            const piece = `\`${t}\` `;
            if (current.length + piece.length > 900) {
                chunks.push(current);
                current = piece;
            } else {
                current += piece;
            }
        }
        if (current) chunks.push(current);

        const embeds = chunks.slice(0, 5).map((chunk, i) =>
            new EmbedBuilder()
                .setColor(0xff2d55)
                .setTitle(
                    i === 0
                        ? `🔥 Available NSFW Tags (${tags.length})`
                        : `Tags (cont. ${i + 1})`
                )
                .setDescription(chunk)
                .setFooter({
                    text: "!tag = real • !tag hentai • !tag 3d • files uploaded"
                })
        );

        return interaction.reply({ embeds, flags: MessageFlags.Ephemeral });
    }

    /**
     * Prefix: !anal | !anal hentai | !anal 3d | !arab anal
     */
    async handleMessage(message) {
        if (!message?.guild || message.author?.bot) return false;
        if (!message.content || !message.content.startsWith("!")) return false;

        const parsed = nsfwManager.parsePrefix(message.content);
        if (!parsed || !parsed.tags.length) return false;

        if (!isNsfwChannel(message.channel)) {
            await message
                .reply({ content: "❌ NSFW tags only work in **NSFW-marked channels**." })
                .catch(() => {});
            return true;
        }

        const enabled = await nsfwManager.isEnabled(message.guildId);
        if (!enabled) {
            await message
                .reply({
                    content:
                        "❌ NSFW system is disabled. Ask an admin to run `/nsfw` and click **Enable**."
                })
                .catch(() => {});
            return true;
        }

        const cfg = await nsfwManager.getConfig(message.guildId);
        const mode = parsed.mode || "real";
        const result = await nsfwManager.fetchForTag(
            parsed.tags,
            mode,
            message.guildId,
            message.author.id,
            cfg
        );

        if (result.error) {
            await message.reply({ content: result.error }).catch(() => {});
            return true;
        }

        const tagLabel = parsed.tags.join(" ");
        const payload = await buildFilePayload(
            result.image,
            tagLabel,
            message.author,
            mode
        );

        if (!payload) {
            await message
                .reply({ content: "❌ Could not download media file. Try again." })
                .catch(() => {});
            return true;
        }

        await message.channel.send(payload).catch(err => {
            logger.error(`NSFW send failed: ${err?.message}`);
        });

        if (message.deletable) {
            message.delete().catch(() => {});
        }

        return true;
    }
}

const nsfwHandler = new NsfwHandler();

export default nsfwHandler;
export { isNsfwChannel };
