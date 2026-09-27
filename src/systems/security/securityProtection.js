/**
 * ============================================================
 * Nocthera v1.1.0
 * Security Protection Engine
 * ============================================================
 */


import logger from "../../core/logger.js";



class SecurityProtection {


    constructor(config, detector) {


        this.config = config;


        this.detector = detector;


        this.active = new Map();


    }



    /**
     * =====================================================
     * Analyze Threat
     * =====================================================
     */

    async protect(

        guildId,

        userId,

        type,

        data = {}

    ) {


        const settings =

            this.config.get(

                guildId

            );



        if (!settings)

            return false;



        const result = {


            blocked: false,


            action: null,


            reason: type


        };



        switch(type) {


            case "SPAM":


                if (

                    settings.antiSpam.enabled

                ) {


                    result.blocked = true;


                    result.action =

                        "TIMEOUT";


                }


                break;



            case "RAID":


                if (

                    settings.antiRaid.enabled

                ) {


                    result.blocked = true;


                    result.action =

                        "LOCKDOWN";


                }


                break;



            case "BOT":


                if (

                    settings.antiBot.enabled

                ) {


                    result.blocked = true;


                    result.action =

                        "KICK";


                }


                break;



            case "NUKE":


                if (

                    settings.antiNuke.enabled

                ) {


                    result.blocked = true;


                    result.action =

                        "LOCKDOWN";


                }


                break;



            default:


                result.action =

                    "NONE";


        }



        if (result.blocked) {


            this.record(

                guildId,

                userId,

                result

            );



            logger.security(

                `Protection triggered: ${type}`

            );


        }



        return result;


    }



    /**
     * =====================================================
     * Record Protection Event
     * =====================================================
     */

    record(

        guildId,

        userId,

        event

    ) {


        const key =

            `${guildId}:${userId}`;



        if (!this.active.has(key)) {


            this.active.set(

                key,

                []

            );


        }



        this.active

            .get(key)

            .push({

                ...event,

                timestamp:

                    Date.now()

            });


    }



    /**
     * =====================================================
     * Check Active Threats
     * =====================================================
     */

    getThreats(

        guildId,

        userId

    ) {


        return (

            this.active.get(

                `${guildId}:${userId}`

            ) || []

        );


    }



    /**
     * =====================================================
     * Clear Protection Cache
     * =====================================================
     */

    clear() {


        this.active.clear();



        logger.security(

            "Protection cache cleared"

        );


    }



    /**
     * =====================================================
     * Status
     * =====================================================
     */

    status() {


        return {


            activeThreats:

                this.active.size


        };


    }



}



export default SecurityProtection;