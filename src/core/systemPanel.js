import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    MessageFlags
} from "discord.js";

export function safeJson(value, max = 1500) {
    try {
        const text = JSON.stringify(value, null, 2);
        return text.length > max ? `${text.slice(0, max - 3)}...` : text;
    } catch {
        return "{}";
    }
}

export function createSystemPanel({ name, emoji = "🌙", description, status = "Configured", buttons = [] }) {
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${emoji} Nocthera ${name}`)
        .setDescription(description)
        .addFields({ name: "Status", value: status, inline: false })
        .setFooter({ text: "Use the controls below. Changes are applied immediately." })
        .setTimestamp();

    const rows = [];
    let row = new ActionRowBuilder();
    for (const button of buttons) {
        if (row.components.length >= 5) {
            rows.push(row);
            row = new ActionRowBuilder();
        }
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(button.id)
                .setLabel(button.label)
                .setStyle(button.style ?? ButtonStyle.Secondary)
                .setEmoji(button.emoji ?? null)
                .setDisabled(Boolean(button.disabled))
        );
    }
    if (row.components.length) rows.push(row);
    return { embeds: [embed], components: rows };
}

export async function replyEphemeral(interaction, payload) {
    return interaction.reply({ ...payload, flags: MessageFlags.Ephemeral });
}

export async function updateEphemeral(interaction, payload) {
    return interaction.update(payload);
}
