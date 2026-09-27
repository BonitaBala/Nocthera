/**
 * ============================================================
 * Nocthera v1.1.0
 * Guild Create Event
 * ============================================================
 */

import logger from "../core/logger.js";

export default {

    name: "guildCreate",

    once: false,

    async execute(client, guild) {

        logger.success(`Joined guild: ${guild.name} (${guild.id})`);

        try {

            // =====================================================
            // Create Default Guild Cache
            // =====================================================

            client.guildConfigs.set(guild.id, {

                prefix: process.env.PREFIX || "!",

                language: "en",

                security: true,

                verification: false,

                logging: false,

                ai: false

            });

            // =====================================================
            // Fetch Owner
            // =====================================================

            const owner = await guild.fetchOwner();

            // =====================================================
            // Send Welcome DM
            // =====================================================

            try {

                await owner.send({

                    embeds: [

                        {
                            color: 0x6b46ff,

                            title: "🌙 Thank you for adding Nocthera!",

                            description:
                                "Thank you for inviting **Nocthera**.\n\nUse **/security**, **/verification**, **/roles**, **/logging** and the other system panels to configure Nocthera.",

                            fields: [

                                {
                                    name: "Next Step",
                                    value: "`/verification` • `/security` • `/roles` • `/logging`"
                                },

                                {
                                    name: "Version",
                                    value: "v1.1.0 Nora"
                                }

                            ],

                            footer: {

                                text: "Nocthera • Discord Management"

                            },

                            timestamp: new Date().toISOString()

                        }

                    ]

                });

            } catch {

                logger.warn(
                    `Unable to DM owner of ${guild.name}.`
                );

            }

            // =====================================================
            // Statistics
            // =====================================================

            client.stats.guildsProtected =
                client.guilds.cache.size;

            logger.info(
                `${guild.name} initialized successfully.`
            );

        } catch (error) {

            logger.error(error.stack);

        }

    }

};