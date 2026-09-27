/**
 * ============================================================
 * Nocthera v1.1.0
 * PostgreSQL Database Manager
 * ============================================================
 *
 * Railway-compatible PostgreSQL connection layer.
 * The rest of Nocthera talks to this manager instead of directly
 * depending on a database driver.
 *
 * Runtime connections can occasionally be dropped by Railway,
 * NAT, Wi-Fi, or an idle database connection. This manager keeps
 * the pool recoverable so a system such as /setup does not fail
 * just because the original pooled connection timed out.
 * ============================================================
 */

import pg from "pg";
import logger from "./logger.js";
import config from "./config.js";

const { Pool } = pg;

const RETRYABLE_ERRORS = new Set([
    "ETIMEDOUT",
    "ECONNRESET",
    "ECONNREFUSED",
    "ENETUNREACH",
    "EHOSTUNREACH",
    "EPIPE",
    "57P01",
    "57P02",
    "57P03"
]);

class DatabaseManager {

    constructor() {

        this.pool = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.registeredEvents = false;
        this.reconnectPromise = null;

    }

    getDatabaseConfig() {

        return config.get("database") ?? {};

    }

    createPool() {

        const database = this.getDatabaseConfig();
        const url = database.url;

        if (!url) {

            throw new Error("DATABASE_URL is missing.");

        }

        const pool = new Pool({

            connectionString: url,

            max: 20,

            // Railway/public TCP connections can occasionally take
            // longer than five seconds to establish from a local PC.
            connectionTimeoutMillis: 15000,

            // Keep idle TCP connections alive and recover cleanly if
            // the remote side closes one.
            idleTimeoutMillis: 30000,
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,

            ssl:
                database.ssl || process.env.NODE_ENV === "production"
                    ? { rejectUnauthorized: false }
                    : false

        });

        pool.on("error", error => {

            this.connected = false;

            logger.error(
                `PostgreSQL pool error: ${error?.message ?? error}`
            );

        });

        return pool;

    }

    async connect() {

        if (this.connected && this.pool) {

            return this.pool;

        }

        if (this.reconnectPromise) {

            return this.reconnectPromise;

        }

        this.reconnectPromise = this._connect();

        try {

            return await this.reconnectPromise;

        } finally {

            this.reconnectPromise = null;

        }

    }

    async _connect() {

        const database = this.getDatabaseConfig();

        if (!database.url) {

            throw new Error("DATABASE_URL is missing.");

        }

        if (this.pool) {

            await this.pool.end().catch(() => {});
            this.pool = null;

        }

        this.connected = false;
        this.registeredEvents = false;

        const pool = this.createPool();

        try {

            await pool.query("SELECT 1");

            this.pool = pool;
            this.connected = true;
            this.reconnectAttempts = 0;
            this.registeredEvents = true;

            logger.success("PostgreSQL connected.");

            return this.pool;

        } catch (error) {

            await pool.end().catch(() => {});

            this.pool = null;
            this.connected = false;
            this.registeredEvents = false;

            logger.fatal(error);

            throw error;

        }

    }

    registerEvents() {

        // Kept for compatibility with existing callers.
        // Pool error listeners are registered in createPool().

        return this.registeredEvents;

    }

    isRetryable(error) {

        if (!error) return false;

        if (RETRYABLE_ERRORS.has(error.code)) {

            return true;

        }

        const message = String(error.message ?? error).toLowerCase();

        return (
            message.includes("connection terminated due to connection timeout") ||
            message.includes("connection timeout") ||
            message.includes("connection terminated") ||
            message.includes("connection reset") ||
            message.includes("socket hang up") ||
            message.includes("network is unreachable")
        );

    }

    async reconnect() {

        if (this.reconnectPromise) {

            return this.reconnectPromise;

        }

        this.reconnectAttempts += 1;

        if (this.reconnectAttempts > this.maxReconnectAttempts) {

            this.reconnectAttempts = 0;

            throw new Error(
                "PostgreSQL reconnect limit reached. Check the Railway database and DATABASE_URL."
            );

        }

        logger.warn(
            `PostgreSQL connection lost. Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
        );

        this.reconnectPromise = this._connect();

        try {

            return await this.reconnectPromise;

        } finally {

            this.reconnectPromise = null;

        }

    }

    async query(text, values = []) {

        // Ensure a usable pool exists before every database operation.
        if (!this.pool || !this.connected) {

            await this.connect();

        }

        try {

            return await this.pool.query(text, values);

        } catch (error) {

            if (!this.isRetryable(error)) {

                throw error;

            }

            this.connected = false;

            if (this.pool) {

                const oldPool = this.pool;
                this.pool = null;
                this.registeredEvents = false;
                await oldPool.end().catch(() => {});

            }

            await this.reconnect();

            return this.pool.query(text, values);

        }

    }

    async disconnect() {

        if (!this.pool) {

            this.connected = false;
            this.registeredEvents = false;
            return;

        }

        const pool = this.pool;

        this.pool = null;
        this.connected = false;
        this.registeredEvents = false;

        await pool.end();

        logger.warn("PostgreSQL connection closed.");

    }

    getConnection() {

        return this.pool;

    }

    getPool() {

        return this.pool;

    }

    async health() {

        const database = this.getDatabaseConfig();

        const result = {

            connected: this.connected,
            readyState: this.connected
                ? "ready"
                : "disconnected",
            host: null,
            database: database.name ?? "nocthera"

        };

        try {

            const response = await this.query(
                `SELECT current_database() AS database,
                        inet_server_addr()::text AS host`
            );

            const row = response.rows[0] ?? {};

            return {

                ...result,
                connected: true,
                readyState: "ready",
                host: row.host ?? null,
                database: row.database ?? result.database

            };

        } catch (error) {

            this.connected = false;

            return {

                ...result,
                connected: false,
                readyState: "disconnected",
                error: error.message

            };

        }

    }

}

const database = new DatabaseManager();

export default database;
