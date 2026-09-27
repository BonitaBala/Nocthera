/**
 * Safe Nocthera Security Self-Test. Uses synthetic data only.
 */
import SecurityService from "./securityService.js";

function test(name, pass, detail = "") { return { name, pass: Boolean(pass), detail }; }

class SecuritySelfTest {
    static async run(client = null, { guildId = "self-test-guild" } = {}) {
        const service = new SecurityService(client);
        const gid = `selftest:${guildId}`;
        const uid = `selftest-user:${Date.now()}`;
        const tests = [];
        try {
            const config = service.config.get(gid);
            tests.push(test("Configuration", service.config.validate(config), "Default configuration loaded and validated."));

            let spam;
            for (let n = 0; n < config.antiSpam.maxMessages; n++) spam = service.detector.register(gid, uid, "MESSAGE");
            tests.push(test("Anti-spam detection", spam.suspicious && spam.threats.includes("SPAM"), `threats=${spam.threats.join(",") || "none"}`));

            service.detector.clear();
            for (let n = 0; n < config.antiRaid.threshold; n++) service.detector.trackGuildEvent(gid, "JOIN");
            const raid = service.detector.register(gid, uid, "JOIN");
            tests.push(test("Anti-raid detection", raid.suspicious && raid.threats.includes("RAID"), `joins=${service.detector.getGuildEvents(gid, "JOIN")}`));

            const bot = service.detector.detectBot({ user: { bot: true } });
            tests.push(test("Anti-bot detection", bot.bot && bot.reason === "BOT_ACCOUNT", `reason=${bot.reason}`));

            for (const [threat, expected] of [["SPAM", "TIMEOUT"], ["RAID", "LOCKDOWN"], ["BOT", "KICK"], ["NUKE", "LOCKDOWN"]]) {
                const p = await service.protection.protect(gid, uid, threat, { selfTest: true });
                tests.push(test(`Protection: ${threat}`, p.blocked && p.action === expected, `action=${p.action}`));
            }

            const botPipeline = await service.handleDetectedThreat(gid, uid, "BOT", { selfTest: true });
            tests.push(test("Pipeline: BOT", botPipeline.protection.action === "KICK" && botPipeline.incident.type === "BOT" && botPipeline.audit.action === "BOT" && botPipeline.punishment?.success === true, "Protection, incident, audit and punishment completed."));

            const nukePipeline = await service.handleDetectedThreat(gid, uid, "NUKE", { selfTest: true });
            tests.push(test("Pipeline: NUKE", nukePipeline.protection.action === "LOCKDOWN" && nukePipeline.incident.type === "NUKE" && nukePipeline.audit.action === "NUKE", "Lockdown decision, incident and audit completed safely."));

            const inc = service.incident.create(gid, "SELF_TEST", { selfTest: true });
            tests.push(test("Incident lifecycle", service.incident.resolve(inc.id, "Self-test cleanup") && service.incident.get(inc.id).resolved, "Create and resolve succeeded."));

            const audit = service.audit.log("SELF_TEST", gid, { selfTest: true });
            tests.push(test("Audit logging", service.audit.getGuildLogs(gid).some(x => x.id === audit.id), "Write and guild lookup succeeded."));

            const punishment = await service.punishment.punish(gid, uid, "WARN", "Self-test");
            tests.push(test("Punishment engine", punishment.success && service.punishment.getHistory(gid, uid).length > 0 && service.punishment.getEscalation(gid, uid) === "WARN", "Record, history and escalation succeeded."));

            service.recovery.saveLockdown(gid, { reason: "Self-test" });
            const recovered = await service.recovery.recover(gid, "Self-test cleanup");
            tests.push(test("Recovery engine", recovered.success && !service.recovery.isLocked(gid), "Lockdown state and recovery succeeded."));

            const status = service.status();
            const health = service.health();
            tests.push(test("Security monitor", Boolean(status.detector && status.protection && status.punishment && status.recovery && status.incidents && status.audit && health.healthy), `healthy=${health.healthy}`));

            if (client?.guilds?.cache?.get(guildId)) {
                const guild = client.guilds.cache.get(guildId);
                const me = guild.members.me ?? await guild.members.fetchMe().catch(() => null);
                const perms = me?.permissions;
                tests.push(test("Bot permissions", Boolean(perms?.has("ViewAuditLog") && perms?.has("ManageChannels") && perms?.has("KickMembers") && perms?.has("ModerateMembers") && perms?.has("BanMembers")), "Requires View Audit Log, Manage Channels, Kick Members, Moderate Members and Ban Members for full automatic protection."));
                tests.push(test("Owner/co-owner alert configuration", Boolean(guild.ownerId), `owner=${guild.ownerId}`));
                const configured = await service.syncGuildConfig(guildId).catch(() => null);
                tests.push(test("Persisted security configuration", Boolean(configured && service.config.validate(configured)), "Database/setup security flags are loaded into the runtime."));
                const checks = { ViewAuditLog: "View Audit Log", ManageChannels: "Manage Channels", KickMembers: "Kick Members", ModerateMembers: "Moderate Members", BanMembers: "Ban Members" };
                for (const [perm,label] of Object.entries(checks)) tests.push(test(`Permission: ${label}`, Boolean(perms?.has(perm)), `Required for full automatic protection.`));
            }
        } catch (error) {
            tests.push(test("Self-test runner", false, error?.stack || String(error)));
        } finally {
            service.reset();
        }
        const passed = tests.filter(x => x.pass).length;
        return { ok: passed === tests.length, passed, failed: tests.length - passed, total: tests.length, tests, timestamp: Date.now() };
    }

    static format(report) {
        return [
            `${report.ok ? "✅" : "⚠️"} **Nocthera Security Self-Test**`,
            `Result: **${report.passed}/${report.total} passed**`,
            "",
            ...report.tests.map(x => `${x.pass ? "✅" : "❌"} ${x.name}${x.detail ? ` — ${x.detail}` : ""}`)
        ].join("\n").slice(0, 1950);
    }
}

export default SecuritySelfTest;
