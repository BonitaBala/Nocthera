/**
 * ============================================================
 * Nocthera v1.1.0
 * Security Audit System
 * ============================================================
 */

import logger from "../../core/logger.js";



class SecurityAudit {


    constructor() {


        this.logs = [];


        this.maxLogs = 10000;


    }



    /**
     * =====================================================
     * Write Audit Log
     * =====================================================
     */

    log(

        action,

        guildId,

        data = {}

    ) {


        const entry = {


            id:

                this.logs.length + 1,


            action,


            guildId,


            timestamp:

                Date.now(),


            ...data


        };



        this.logs.push(

            entry

        );



        if (

            this.logs.length >

            this.maxLogs

        ) {


            this.logs.shift();


        }



        logger.security(

            `[AUDIT] ${action}`

        );



        return entry;


    }



    /**
     * =====================================================
     * Get Guild Logs
     * =====================================================
     */

    getGuildLogs(

        guildId

    ) {


        return this.logs.filter(

            log =>

                log.guildId === guildId

        );


    }



    /**
     * =====================================================
     * Get Logs By Action
     * =====================================================
     */

    getByAction(

        action

    ) {


        return this.logs.filter(

            log =>

                log.action === action

        );


    }



    /**
     * =====================================================
     * Latest Logs
     * =====================================================
     */

    latest(

        limit = 25

    ) {


        return this.logs

            .slice(

                -limit

            )

            .reverse();


    }



    /**
     * =====================================================
     * Search Logs
     * =====================================================
     */

    search(

        callback

    ) {


        return this.logs.filter(

            callback

        );


    }



    /**
     * =====================================================
     * Delete Guild Logs
     * =====================================================
     */

    clearGuild(

        guildId

    ) {


        this.logs = this.logs.filter(

            log =>

                log.guildId !== guildId

        );


    }



    /**
     * =====================================================
     * Clear Everything
     * =====================================================
     */

    clear() {


        this.logs = [];



        logger.security(

            "Security audit logs cleared"

        );


    }



    /**
     * =====================================================
     * Status
     * =====================================================
     */

    status() {


        return {


            totalLogs:

                this.logs.length,


            maxLogs:

                this.maxLogs


        };


    }


}



export default SecurityAudit;