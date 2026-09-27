/**
 * ============================================================
 * Nocthera v1.1.0
 * Owner Alert System
 * ============================================================
 */

import {
    EmbedBuilder
} from "discord.js";

import logger from "../../../core/logger.js";

class DMOwnerAlert {

    constructor() {

        this.name = "DM Owner Alert";

    }

    async execute(client, incident, analysis = null) {

        try {

            const guild = incident.guild;

            if (!guild)
                return;

            const owner = await guild.fetchOwner();

            if (!owner)
                return;

            const embed = new EmbedBuilder()

                .setColor(this.getColor(incident.severity))

                .setTitle("🚨 Nocthera Security Alert")

                .setDescription(

                    "Suspicious moderator activity has been detected."

                )

                .addFields(

                    {

                        name: "Server",

                        value: `${guild.name}\n\`${guild.id}\``,

                        inline: false

                    },

                    {

                        name: "Moderator",

                        value:

                            `${incident.moderator.user.tag}\n<@${incident.moderator.id}>`,

                        inline: true

                    },

                    {

                        name: "Action",

                        value: incident.action,

                        inline: true

                    },

                    {

                        name: "Severity",

                        value: incident.severity,

                        inline: true

                    },

                    {

                        name: "Risk Score",

                        value: String(

                            analysis?.score ??

                            incident.score ??

                            0

                        ),

                        inline: true

                    },

                    {

                        name: "Risk Level",

                        value:

                            analysis?.level ??

                            incident.severity,

                        inline: true

                    },

                    {

                        name: "Recommendation",

                        value:

                            analysis?.recommendation ??

                            "Continue monitoring.",

                        inline: false

                    }

                )

                .setFooter({

                    text: "Nocthera Security"

                })

                .setTimestamp();

            await owner.send({

                embeds: [embed]

            });

            // ==========================================
            // Future Security Contacts
            // ==========================================

            // for (const userId of securityContacts)
            // {
            //      send same embed
            // }

            logger.security(

                `Owner alerted for ${guild.name}.`

            );

        }

        catch (error) {

            logger.warn(

                "Unable to DM the server owner."

            );

        }

    }

    getColor(level) {

        switch (level) {

            case "CRITICAL":

                return 0xff0000;

            case "HIGH":

                return 0xff6b00;

            case "MEDIUM":

                return 0xffcc00;

            default:

                return 0x2ecc71;

        }

    }

}

export default new DMOwnerAlert();