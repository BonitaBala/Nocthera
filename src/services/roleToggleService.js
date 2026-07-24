import { PermissionFlagsBits } from 'discord.js';
import { createError, ErrorTypes } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';
import selfRoleConfig from '../config/selfRoles.js';

export async function toggleRole(interaction, roleId) {
    const guild = interaction.guild;

    if (!guild) {
        throw createError(
            'Guild not found.',
            ErrorTypes.CONFIGURATION,
            'This button can only be used inside a server.'
        );
    }

    const member = await guild.members.fetch(interaction.user.id);

    if (!member) {
        throw createError(
            'Member not found.',
            ErrorTypes.USER_INPUT,
            'Could not find your member information.'
        );
    }

    const role = guild.roles.cache.get(roleId);

    // Make sure the role exists BEFORE using it
    if (!role) {
        throw createError(
            `Role ${roleId} not found.`,
            ErrorTypes.CONFIGURATION,
            'This self-role no longer exists.'
        );
    }

    // Prevent assigning @everyone
    if (role.id === guild.id) {
        throw createError(
            'Attempted to assign @everyone.',
            ErrorTypes.PERMISSION,
            'That role cannot be assigned.'
        );
    }

    // Prevent managed/integration roles
    if (role.managed) {
        throw createError(
            'Managed role.',
            ErrorTypes.PERMISSION,
            'This role is managed by another application.'
        );
    }

    // Only allow configured self roles (unless allowAllRoles is enabled)
    if (
        !selfRoleConfig.allowAllRoles &&
        !selfRoleConfig.allowedRoles.includes(role.id)
    ) {
        throw createError(
            'Role is not configured as self assignable.',
            ErrorTypes.PERMISSION,
            'You cannot assign yourself this role.'
        );
    }

    // Block dangerous permission roles
    if (selfRoleConfig.blockAdministratorRoles) {
        const blocked = selfRoleConfig.blockedPermissions.some(permission => {
            const permissionFlag = PermissionFlagsBits[permission];
            return permissionFlag && role.permissions.has(permissionFlag);
        });

        if (blocked) {
            throw createError(
                'Protected role.',
                ErrorTypes.PERMISSION,
                'This role cannot be self-assigned.'
            );
        }
    }

    const botMember = await guild.members.fetchMe();

    if (!botMember) {
        throw createError(
            'Bot member unavailable.',
            ErrorTypes.CONFIGURATION,
            'Unable to verify my permissions.'
        );
    }

    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
        throw createError(
            'Missing Manage Roles permission.',
            ErrorTypes.PERMISSION,
            'I need the **Manage Roles** permission.'
        );
    }

    // Bot role must be higher than target role
    if (role.position >= botMember.roles.highest.position) {
        throw createError(
            'Role hierarchy issue.',
            ErrorTypes.PERMISSION,
            'My highest role must be above this role.'
        );
    }

    const hasRole = member.roles.cache.has(role.id);

    if (hasRole) {
        await member.roles.remove(role, 'Self-role toggle');

        logger.info('Self-role removed', {
            guildId: guild.id,
            userId: member.id,
            roleId: role.id,
            roleName: role.name
        });

        return {
            success: true,
            action: 'removed',
            role
        };
    }

    await member.roles.add(role, 'Self-role toggle');

const refreshedMember = await guild.members.fetch(member.id);

logger.info('Role debug after add', {
    expectedRole: role.id,
    hasRole: refreshedMember.roles.cache.has(role.id),
    roles: refreshedMember.roles.cache.map(r => `${r.name} (${r.id})`)
});
    await member.fetch(true);

logger.info('Roles after add', {
    userRoles: [...member.roles.cache.keys()]
});
    logger.info('Self-role added', {
        guildId: guild.id,
        userId: member.id,
        roleId: role.id,
        roleName: role.name
    });

    return {
        success: true,
        action: 'added',
        role
    };
}

export default {
    toggleRole
};
