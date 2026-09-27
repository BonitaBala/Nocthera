/**
 * ============================================================
 * Nocthera v1.1.0
 * Logger
 * ============================================================
 */

import fs from "node:fs";
import path from "node:path";
import winston from "winston";
import chalk from "chalk";

const LOG_DIRECTORY = path.resolve("logs");

if (!fs.existsSync(LOG_DIRECTORY)) {
    fs.mkdirSync(LOG_DIRECTORY, { recursive: true });
}

const logger = winston.createLogger({

    level: process.env.LOG_LEVEL || "info",

    format: winston.format.combine(

        winston.format.timestamp({

            format: "YYYY-MM-DD HH:mm:ss"

        }),

        winston.format.printf(({ timestamp, level, message }) => {

            return `[${timestamp}] [${level.toUpperCase()}] ${message}`;

        })

    ),

    transports: [

        new winston.transports.File({

            filename: path.join(LOG_DIRECTORY, "combined.log")

        }),

        new winston.transports.File({

            filename: path.join(LOG_DIRECTORY, "error.log"),

            level: "error"

        }),

        new winston.transports.File({

            filename: path.join(LOG_DIRECTORY, "security.log"),

            level: "warn"

        })

    ]

});

const print = (color, tag, message) => {

    console.log(
        color(`[${tag}]`) +
        " " +
        message
    );

};

const Logger = {

    version: "1.1.0",

    start() {

        print(chalk.magenta, "BOOT", "Starting Nocthera...");

    },

    info(message) {

        logger.info(message);

        print(chalk.cyan, "INFO", message);

    },

    success(message) {

        logger.info(message);

        print(chalk.green, "SUCCESS", message);

    },

    warn(message) {

        logger.warn(message);

        print(chalk.yellow, "WARNING", message);

    },

    error(message) {

        logger.error(message);

        print(chalk.red, "ERROR", message);

    },

    security(message) {

        logger.warn(`[SECURITY] ${message}`);

        print(chalk.redBright, "SECURITY", message);

    },

    debug(message) {

        if (process.env.NODE_ENV !== "production") {

            logger.debug(message);

            print(chalk.gray, "DEBUG", message);

        }

    },

    fatal(error) {

        logger.error(error.stack || error);

        print(chalk.bgRed.white, "FATAL", error.stack || error);

    }

};

process.on("uncaughtException", (error) => {

    Logger.fatal(error);

});

process.on("unhandledRejection", (reason) => {

    Logger.fatal(reason);

});

export default Logger;