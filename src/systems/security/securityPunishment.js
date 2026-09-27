/**
 * ============================================================
 * Nocthera v1.1.0
 * Security Punishment Engine
 * ============================================================
 */


import logger from "../../core/logger.js";



class SecurityPunishment {


    constructor() {


        this.history = new Map();


    }



    /**
     * =====================================================
     * Execute Punishment
     * =====================================================
     */

    async punish(

        guildId,

        userId,

        action,

        reason = "Security violation",

        executor = "Nocthera"

    ) {


        const punishment = {


            guildId,


            userId,


            action,


            reason,


            executor,


            timestamp:

                Date.now()


        };



        this.record(

            punishment

        );



        logger.security(

            `Punishment executed: ${action} for ${userId}`

        );



        return {


            success: true,


            punishment


        };


    }



    /**
     * =====================================================
     * Available Actions
     * =====================================================
     */

    actions() {


        return [


            "WARN",


            "TIMEOUT",


            "KICK",


            "BAN"


        ];


    }



    /**
     * =====================================================
     * Record Punishment
     * =====================================================
     */

    record(data) {


        const key =

            `${data.guildId}:${data.userId}`;



        if (!this.history.has(key)) {


            this.history.set(

                key,

                []

            );


        }



        this.history

            .get(key)

            .push(data);


    }



    /**
     * =====================================================
     * Get User Punishment History
     * =====================================================
     */

    getHistory(

        guildId,

        userId

    ) {


        return (

            this.history.get(

                `${guildId}:${userId}`

            ) || []

        );


    }



    /**
     * =====================================================
     * Escalation System
     * =====================================================
     */

    getEscalation(

        guildId,

        userId

    ) {


        const count =

            this.getHistory(

                guildId,

                userId

            ).length;



        if (count >= 5)

            return "BAN";



        if (count >= 3)

            return "TIMEOUT";



        if (count >= 1)

            return "WARN";



        return "NONE";


    }



    /**
     * =====================================================
     * Clear History
     * =====================================================
     */

    clear() {


        this.history.clear();



        logger.security(

            "Punishment history cleared"

        );


    }



    /**
     * =====================================================
     * Status
     * =====================================================
     */

    status() {


        return {


            trackedUsers:

                this.history.size


        };


    }



}



export default SecurityPunishment;