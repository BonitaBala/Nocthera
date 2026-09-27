/**
 * ============================================================
 * Nocthera v1.1.0
 * External Button Compatibility
 * ============================================================
 *
 * Discord link buttons never create interactions. Non-link
 * buttons do, and their custom_id must be handled by a bot.
 * This module lets Nocthera handle common role-button IDs
 * without relying on another application being online.
 */

import { MessageFlags } from "discord.js";

const ROLE_PATTERNS = [
    // Kawaiiprinting / Kawaii Discord Server Creator
    // Example: role_toggle:1278446189846462537
    /^role_toggle:(\d{15,25})$/i,
    /^role[:_\-](\d{15,25})$/i,
    /^addrole[:_\-](\d{15,25})$/i,
    /^togglerole[:_\-](\d{15,25})$/i,
    /^rolebutton[:_\-](\d{15,25})$/i,
    /^kiwi[:_\-]role[:_\-](\d{15,25})$/i,
    /^kiwi[:_\-]addrole[:_\-](\d{15,25})$/i,
    /^kiwi_role[:_\-](\d{15,25})$/i,
    /^kiwi_addrole[:_\-](\d{15,25})$/i,
    /^button[:_\-]role[:_\-](\d{15,25})$/i,
    /^button_role[:_\-](\d{15,25})$/i
];

function extractRoleId(customId) {
    const value = String(customId ?? "").trim();

    for (const pattern of ROLE_PATTERNS) {
        const match = value.match(pattern);
        if (match) return match[1];
    }

    return null;
}

async function handleRoleButton(interaction, roleId) {
    if (!interaction.inGuild()) {
        await interaction.reply({
            content: "❌ Role buttons only work inside a server.",
            flags: MessageFlags.Ephemeral
        });
        return true;
    }

    const role = await interaction.guild.roles.fetch(roleId).catch(() => null);

    if (!role) {
        await interaction.reply({
            content: "❌ The role attached to this button no longer exists.",
            flags: MessageFlags.Ephemeral
        });
        return true;
    }

    const member = interaction.member;

    if (!member?.roles) {
        await interaction.reply({
            content: "❌ I couldn't access your server roles.",
            flags: MessageFlags.Ephemeral
        });
        return true;
    }

    if (role.managed) {
        await interaction.reply({
            content: "❌ That is a managed role and cannot be assigned by the bot.",
            flags: MessageFlags.Ephemeral
        });
        return true;
    }

    const me = interaction.guild.members.me
        ?? await interaction.guild.members.fetchMe().catch(() => null);

    if (!me) {
        await interaction.reply({
            content: "❌ I couldn't resolve Nocthera's server member.",
            flags: MessageFlags.Ephemeral
        });
        return true;
    }

    if (!me.permissions.has("ManageRoles")) {
        await interaction.reply({
            content: "❌ Nocthera needs **Manage Roles** to use this button.",
            flags: MessageFlags.Ephemeral
        });
        return true;
    }

    if (role.position >= me.roles.highest.position) {
        await interaction.reply({
            content: "❌ I can't manage that role. Move Nocthera's highest role above the selected role.",
            flags: MessageFlags.Ephemeral
        });
        return true;
    }

    try {
        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role, "Nocthera compatible role button");
            await interaction.reply({
                content: `➖ Removed <@&${role.id}> from you.`,
                flags: MessageFlags.Ephemeral
            });
        } else {
            await member.roles.add(role, "Nocthera compatible role button");
            await interaction.reply({
                content: `✅ Added <@&${role.id}> to you.`,
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (error) {
        console.error("[BUTTON COMPATIBILITY] Role button failed:", error);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "❌ I couldn't update your role. Check Nocthera's Manage Roles permission and role hierarchy.",
                flags: MessageFlags.Ephemeral
            }).catch(() => {});
        }
    }

    return true;
}

export async function handleCompatibleButton(interaction) {
    if (!interaction?.isButton?.()) return false;

    const roleId = extractRoleId(interaction.customId);
    if (roleId) {
        return handleRoleButton(interaction, roleId);
    }

    return false;
}

export function isCompatibleButton(interaction) {
    return Boolean(interaction?.isButton?.() && extractRoleId(interaction.customId));
}
