/**
 * ============================================================
 * Nocthera v1.1.0
 * Architecture Validator
 * ============================================================
 */

import fs from "node:fs";
import path from "node:path";
import architecture from "../../architecture.js";

class ArchitectureValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    exists(target) {
        return fs.existsSync(path.resolve(process.cwd(), target));
    }

    validateFolders() {
        console.log("📁 Checking folders...");

        for (const [folder, created] of Object.entries(architecture.folders)) {
            if (!created) continue;

            const folderPath = folder === "root"
                ? "."
                : ["core", "commands", "systems", "events"].includes(folder)
                    ? path.join("src", folder)
                    : folder;

            if (!this.exists(folderPath)) {
                this.errors.push(`Missing folder: ${folderPath}`);
            }
        }
    }

    validateFiles() {
        console.log("📄 Checking files...");

        for (const [file, status] of Object.entries(architecture.files ?? {})) {
            if (status === "missing") continue;

            if (!this.exists(file)) {
                this.errors.push(`Missing file: ${file}`);
            }
        }
    }

    validateModules() {
        console.log("🧩 Checking modules...");

        for (const [module, status] of Object.entries(architecture.modules)) {
            if (status === "planned") {
                this.warnings.push(`Module not started: ${module}`);
            }
        }
    }

    summary() {
        console.log("\n==============================");
        console.log(" Nocthera Architecture Report ");
        console.log("==============================");

        if (this.errors.length === 0) {
            console.log("✅ No critical errors.");
        } else {
            console.log(`❌ ${this.errors.length} Critical Error(s)\n`);

            this.errors.forEach(error => {
                console.log(`• ${error}`);
            });
        }

        if (this.warnings.length > 0) {
            console.log(`\n⚠ ${this.warnings.length} Warning(s)\n`);

            this.warnings.forEach(warning => {
                console.log(`• ${warning}`);
            });
        }

        console.log("\n==============================");

        return this.errors.length === 0;
    }

    run() {
        console.log("\n🌙 Nocthera Validator\n");

        this.validateFolders();
        this.validateFiles();
        this.validateModules();

        return this.summary();
    }
}

const validator = new ArchitectureValidator();

export default validator;