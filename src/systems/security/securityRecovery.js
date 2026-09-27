/**
 * ============================================================
 * Nocthera v1.1.0
 * Security Recovery Engine
 * ============================================================
 */

import logger from "../../core/logger.js";



class SecurityRecovery {


    constructor() {


        this.history = [];


        this.lockdowns = new Map();


    }



    /**
     * =====================================================
     * Save Lockdown State
     * =====================================================
     */

    saveLockdown(

        guildId,

        data

    ) {


        this.lockdowns.set(

            guildId,

            {

                ...data,

                timestamp:

                    Date.now()

            }

        );


    }



    /**
     * =====================================================
     * Recover Guild
     * =====================================================
     */

    async recover(

        guildId,

        reason = "Recovery"

    ) {


        const state =

            this.lockdowns.get(

                guildId

            );



        if (!state) {


            return {


                success: false,


                reason:

                    "No recovery data found."


            };


        }



        const report = {


            guildId,


            reason,


            recovered:

                true,


            timestamp:

                Date.now()


        };



        this.history.push(

            report

        );



        this.lockdowns.delete(

            guildId

        );



        logger.security(

            `Guild ${guildId} recovered successfully.`

        );



        return {


            success: true,


            report


        };


    }



    /**
     * =====================================================
     * Cancel Lockdown
     * =====================================================
     */

    cancelLockdown(

        guildId

    ) {


        return this.lockdowns.delete(

            guildId

        );


    }



    /**
     * =====================================================
     * Check Lockdown
     * =====================================================
     */

    isLocked(

        guildId

    ) {


        return this.lockdowns.has(

            guildId

        );


    }



    /**
     * =====================================================
     * Get Recovery History
     * =====================================================
     */

    getHistory() {


        return this.history;


    }



    /**
     * =====================================================
     * Clear Recovery History
     * =====================================================
     */

    clear() {


        this.history = [];


        this.lockdowns.clear();



        logger.security(

            "Recovery history cleared."

        );


    }



    /**
     * =====================================================
     * Status
     * =====================================================
     */

    status() {


        return {


            activeLockdowns:

                this.lockdowns.size,


            recoveries:

                this.history.length


        };


    }


}



export default SecurityRecovery;