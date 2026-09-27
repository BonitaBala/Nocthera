/**
 * ============================================================
 * Nocthera v1.1.0
 * Security Incident Manager
 * ============================================================
 */

import logger from "../../core/logger.js";



class SecurityIncident {


    constructor() {


        this.incidents = [];


        this.nextId = 1;


    }



    /**
     * =====================================================
     * Create Incident
     * =====================================================
     */

    create(

        guildId,

        type,

        data = {}

    ) {


        const incident = {


            id:

                this.nextId++,


            guildId,


            type,


            timestamp:

                Date.now(),


            resolved:

                false,


            ...data


        };



        this.incidents.push(

            incident

        );



        logger.security(

            `Incident recorded: ${type} (${incident.id})`

        );



        return incident;


    }



    /**
     * =====================================================
     * Resolve Incident
     * =====================================================
     */

    resolve(

        incidentId,

        resolution = "Resolved"

    ) {


        const incident =

            this.incidents.find(

                entry =>

                    entry.id === incidentId

            );



        if (!incident)

            return false;



        incident.resolved = true;


        incident.resolution = resolution;


        incident.resolvedAt = Date.now();



        logger.security(

            `Incident ${incidentId} resolved`

        );



        return true;


    }



    /**
     * =====================================================
     * Get Incident
     * =====================================================
     */

    get(

        incidentId

    ) {


        return this.incidents.find(

            entry =>

                entry.id === incidentId

        ) || null;


    }



    /**
     * =====================================================
     * Get Guild Incidents
     * =====================================================
     */

    getGuild(

        guildId

    ) {


        return this.incidents.filter(

            entry =>

                entry.guildId === guildId

        );


    }



    /**
     * =====================================================
     * Get Incidents By Type
     * =====================================================
     */

    getByType(

        type

    ) {


        return this.incidents.filter(

            entry =>

                entry.type === type

        );


    }



    /**
     * =====================================================
     * Get Open Incidents
     * =====================================================
     */

    getOpen() {


        return this.incidents.filter(

            entry =>

                !entry.resolved

        );


    }



    /**
     * =====================================================
     * Clear Incidents
     * =====================================================
     */

    clear() {


        this.incidents = [];


        this.nextId = 1;



        logger.security(

            "Security incidents cleared"

        );


    }



    /**
     * =====================================================
     * Status
     * =====================================================
     */

    status() {


        return {


            total:

                this.incidents.length,


            open:

                this.getOpen().length,


            resolved:

                this.incidents.filter(

                    entry =>

                        entry.resolved

                ).length


        };


    }


}



export default SecurityIncident;