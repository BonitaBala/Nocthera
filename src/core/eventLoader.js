/**
 * ============================================================
 * Nocthera v1.1.0
 * Legacy Event Loader Bridge
 * ============================================================
 *
 * The actual event loading is now handled by:
 *
 *     src/events/
 *
 * This file remains as a compatibility bridge for older
 * parts of Nocthera that may still import core/eventLoader.js.
 * ============================================================
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import logger from "./logger.js";
import events from "../events/index.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const EVENTS_DIRECTORY = path.resolve(
    __dirname,
    "../events"
);

export default async function loadEvents(client) {

    try {

        if (!client) {

            throw new Error(
                "Discord client is required."
            );

        }

        logger.info(
            "Loading events through the event system..."
        );

        // =====================================================
        // Initialize
        // =====================================================

        await events.initialize(

            client

        );

        // =====================================================
        // Load
        // =====================================================

        const result =
            await events.load(

                EVENTS_DIRECTORY

            );

        // =====================================================
        // Update Runtime Statistics
        // =====================================================

        client.stats.eventsLoaded =
            client.events.size;

        // =====================================================
        // Report
        // =====================================================

        logger.info(

            `${result.loaded.length} event(s) loaded.`

        );

        if (result.failed.length > 0) {

            logger.warn(

                `${result.failed.length} event(s) failed.`

            );

        }

        return result;

    } catch (error) {

        logger.fatal(

            error?.stack ??
            error

        );

        throw error;

    }

}