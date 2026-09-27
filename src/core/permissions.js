/**
 * ============================================================
 * Nocthera v1.1.0
 * Permission Manager
 * ============================================================
 */

import {
    PermissionFlagsBits
} from "discord.js";

import config from "./config.js";

class PermissionManager {

    constructor() {

        this.securityContacts = new Set();

        this.trustedRoles = new Map();

        this.commandPermissions = new Map();

    }

    // =====================================================
    // Owner
    // =====================================================

    isOwner(userId) {

        return userId === config.getValue("discord", "ownerId");

    }

    // =====================================================
    // Security Contacts
    // =====================================================

    isSecurityContact(userId) {

        return this.securityContacts.has(userId);

    }

    addSecurityContact(userId) {

        this.securityContacts.add(userId);

    }

    removeSecurityContact(userId) {

        this.securityContacts.delete(userId);

    }

    getSecurityContacts() {

        return [...this.securityContacts];

    }

    // =====================================================
    // Discord Permissions
    // =====================================================

    isAdministrator(member) {

        return member.permissions.has(
            PermissionFlagsBits.Administrator
        );

    }

    isModerator(member) {

        return member.permissions.has(
            PermissionFlagsBits.ModerateMembers
        );

    }

    canManageRoles(member) {

        return member.permissions.has(
            PermissionFlagsBits.ManageRoles
        );

    }

    canManageChannels(member) {

        return member.permissions.has(
            PermissionFlagsBits.ManageChannels
        );

    }

    canBan(member) {

        return member.permissions.has(
            PermissionFlagsBits.BanMembers
        );

    }

    canKick(member) {

        return member.permissions.has(
            PermissionFlagsBits.KickMembers
        );

    }

    // =====================================================
    // Trusted Roles
    // =====================================================

    addTrustedRole(guildId, roleId) {

        if (!this.trustedRoles.has(guildId)) {

            this.trustedRoles.set(guildId, new Set());

        }

        this.trustedRoles.get(guildId).add(roleId);

    }

    removeTrustedRole(guildId, roleId) {

        this.trustedRoles.get(guildId)?.delete(roleId);

    }

    isTrustedRole(guildId, roleId) {

        return this.trustedRoles
            .get(guildId)
            ?.has(roleId) ?? false;

    }

    // =====================================================
    // Command Permissions
    // =====================================================

    registerCommand(command, permission) {

        this.commandPermissions.set(command, permission);

    }

    getCommandPermission(command) {

        return this.commandPermissions.get(command);

    }

    canUseCommand(member, command) {

        const permission = this.getCommandPermission(command);

        if (!permission)
            return true;

        return member.permissions.has(permission);

    }

    // =====================================================
    // Global Permission Check
    // =====================================================

    hasAccess(member, command = null) {

        if (this.isOwner(member.id))
            return true;

        if (this.isAdministrator(member))
            return true;

        if (this.isSecurityContact(member.id))
            return true;

        if (command)
            return this.canUseCommand(member, command);

        return false;

    }

}

export default new PermissionManager();