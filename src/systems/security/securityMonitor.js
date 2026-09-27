/**
 * ============================================================
 * Nocthera v1.1.0
 * Security Monitor
 * ============================================================
 */

import logger from "../../core/logger.js";



class SecurityMonitor {


    constructor(

        detector,

        protection,

        punishment,

        recovery,

        incident,

        audit

    ) {


        this.detector = detector;

        this.protection = protection;

        this.punishment = punishment;

        this.recovery = recovery;

        this.incident = incident;

        this.audit = audit;

    }



    /**
     * =====================================================
     * Complete System Status
     * =====================================================
     */

    status() {


        return {


            detector:

                this.detector.status(),


            protection:

                this.protection.status(),


            punishment:

                this.punishment.status(),


            recovery:

                this.recovery.status(),


            incidents:

                this.incident.status(),


            audit:

                this.audit.status(),


            timestamp:

                Date.now()


        };


    }



    /**
     * =====================================================
     * System Health
     * =====================================================
     */

    health() {


        const status = this.status();



        return {


            healthy: true,


            activeThreats:

                status.protection.activeThreats,


            openIncidents:

                status.incidents.open,


            trackedUsers:

                status.punishment.trackedUsers,


            activeLockdowns:

                status.recovery.activeLockdowns


        };


    }



    /**
     * =====================================================
     * Print Summary
     * =====================================================
     */

    summary() {


        const health =

            this.health();



        logger.security(

            `Threats: ${health.activeThreats} | ` +

            `Incidents: ${health.openIncidents} | ` +

            `Lockdowns: ${health.activeLockdowns}`

        );



        return health;


    }



    /**
     * =====================================================
     * Reset Monitor
     * =====================================================
     */

    reset() {


        this.detector.clear();

        this.protection.clear();

        this.punishment.clear();

        this.recovery.clear();

        this.incident.clear();

        this.audit.clear();



        logger.security(

            "Security monitor reset"

        );


    }


}



export default SecurityMonitor;