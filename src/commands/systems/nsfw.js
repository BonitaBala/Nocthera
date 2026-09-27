import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import nsfw from "../../systems/nsfw/index.js";
import { createSystemPanel, replyEphemeral } from "../../core/systemPanel.js";

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

export default {
    category: "nsfw",
    permission: PermissionFlagsBits.SendMessages,
    data: new SlashCommandBuilder()
        .setName("nsfw")
        .setDescription("Open the NSFW management panel (categories, tags, enable/disable)."),

    async execute(client, interaction) {
        const cfg = await nsfw.manager.getConfig(interaction.guildId);

        return replyEphemeral(
            interaction,
            createSystemPanel({
                name: "NSFW",
                emoji: "🔥",
                description:
                    "**Adult image tag system** — only works in **NSFW channels**.\n\n" +
                    "• `!anal` → **Real Life** anal\n" +
                    "• `!anal hentai` → Hentai anal\n" +
                    "• `!anal 3d` → 3D anal\n" +
                    "• `!arab anal` → Real Life arab + anal\n\n" +
                    "Admins toggle categories with the buttons below.",
                status: buildStatusText(cfg),
                buttons: [
                    { id: "nsfw:enable", label: "Enable", emoji: "✅", style: 3 },
                    { id: "nsfw:disable", label: "Disable", emoji: "🛑", style: 4 },
                    { id: "nsfw:status", label: "Status", emoji: "ℹ️", style: 2 },
                    { id: "nsfw:tags", label: "All Tags", emoji: "🏷️", style: 1 },
                    { id: "nsfw:cat:real", label: "Real Life", emoji: "📷", style: cfg.categories?.real !== false ? 3 : 2 },
                    { id: "nsfw:cat:hentai", label: "Hentai", emoji: "🌸", style: cfg.categories?.hentai !== false ? 3 : 2 },
                    { id: "nsfw:cat:3d", label: "3D", emoji: "🧊", style: cfg.categories?.["3d"] !== false ? 3 : 2 }
                ]
            })
        );
    }
};
