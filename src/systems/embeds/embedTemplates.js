/**
 * ============================================================
 * Nocthera v1.1.0
 * Professional Embed Templates
 * ============================================================
 */

class EmbedTemplates {

    constructor() {
        this.templates = new Map();
        this.registerDefaults();
    }

    registerDefaults() {
        const templates = {
            success: {
                title: "✅ Action Successful",
                description: "{message}",
                color: 0x57F287,
                footer: { text: "Nocthera • Success" }
            },

            error: {
                title: "❌ Something Went Wrong",
                description: "{message}",
                color: 0xED4245,
                footer: { text: "Nocthera • Error" }
            },

            warning: {
                title: "⚠️ Please Take Note",
                description: "{message}",
                color: 0xFEE75C,
                footer: { text: "Nocthera • Warning" }
            },

            info: {
                title: "ℹ️ Information",
                description: "{message}",
                color: 0x5865F2,
                footer: { text: "Nocthera • Information" }
            },

            welcome: {
                title: "🌙 Welcome to {server}",
                description: "Hey {user}, welcome! We're glad to have you here.",
                color: 0x5865F2,
                fields: [
                    { name: "📜 Start Here", value: "Check the server rules and information channels before getting started.", inline: false },
                    { name: "💬 Meet the Community", value: "Introduce yourself and join the conversation.", inline: true },
                    { name: "🛡️ Stay Safe", value: "Never share passwords, tokens, or private information.", inline: true }
                ],
                footer: { text: "Enjoy your stay • {server}" },
                timestamp: true
            },

            announcement: {
                title: "📢 {title}",
                description: "{message}",
                color: 0x5865F2,
                footer: { text: "Official Server Announcement" },
                timestamp: true
            },

            verification: {
                title: "🛡️ Server Verification",
                description: "Welcome! Before accessing the rest of the server, please complete the verification step below.",
                color: 0x57F287,
                fields: [
                    { name: "1️⃣ Read the Rules", value: "Make sure you understand and agree to the server rules.", inline: false },
                    { name: "2️⃣ Verify", value: "Use the verification button below to gain access.", inline: false },
                    { name: "3️⃣ Need Help?", value: "Contact a moderator if you have trouble verifying.", inline: false }
                ],
                footer: { text: "Verification • Keep your account secure" }
            },

            rules: {
                title: "📜 Server Rules",
                description: "Please read and follow these rules. By remaining in the server, you agree to follow them.",
                color: 0x5865F2,
                fields: [
                    { name: "01 • Respect Everyone", value: "No harassment, hate speech, bullying, or targeted abuse.", inline: false },
                    { name: "02 • Keep It Appropriate", value: "Keep content suitable for the server and its intended audience.", inline: false },
                    { name: "03 • No Spam", value: "Avoid flooding channels, excessive mentions, or disruptive behavior.", inline: false },
                    { name: "04 • No Unauthorized Advertising", value: "Do not advertise or promote unrelated services without permission.", inline: false },
                    { name: "05 • Follow Staff Instructions", value: "Moderators may act to protect the community and maintain order.", inline: false }
                ],
                footer: { text: "Please review the rules regularly." }
            },

            ticket_panel: {
                title: "🎫 Support Center",
                description: "Need help? Open a ticket and our team will assist you as soon as possible.",
                color: 0x5865F2,
                fields: [
                    { name: "🛠️ Technical Support", value: "Get help with technical problems or configuration.", inline: true },
                    { name: "📩 General Support", value: "Ask questions or request assistance.", inline: true },
                    { name: "⚖️ Moderation", value: "Report an issue privately to the staff team.", inline: true }
                ],
                footer: { text: "Please do not open duplicate tickets." }
            },

            moderation_notice: {
                title: "🛡️ Moderation Notice",
                description: "{message}",
                color: 0xED4245,
                fields: [
                    { name: "Action", value: "{action}", inline: true },
                    { name: "Moderator", value: "{moderator}", inline: true },
                    { name: "Member", value: "{user}", inline: true }
                ],
                footer: { text: "Nocthera Moderation System" },
                timestamp: true
            },

            server_info: {
                title: "🌙 {server} • Server Information",
                description: "Welcome to **{server}**. Here is a quick overview of the community.",
                color: 0x5865F2,
                fields: [
                    { name: "👥 Members", value: "{members}", inline: true },
                    { name: "💬 Channels", value: "{channels}", inline: true },
                    { name: "🛡️ Security", value: "Protected by Nocthera", inline: true },
                    { name: "📚 Information", value: "Please check the rules and information channels for important details.", inline: false }
                ],
                footer: { text: "Powered by Nocthera" }
            },

            giveaway: {
                title: "🎉 Giveaway",
                description: "{prize}\n\nReact or use the button below to enter!",
                color: 0xEB459E,
                fields: [
                    { name: "🏆 Prize", value: "{prize}", inline: true },
                    { name: "👑 Winner", value: "{winnerCount}", inline: true },
                    { name: "⏰ Ends", value: "{ends}", inline: true }
                ],
                footer: { text: "Good luck to everyone!" },
                timestamp: true
            },

            event: {
                title: "📅 {event}",
                description: "{message}",
                color: 0x9B59B6,
                fields: [
                    { name: "📍 Location", value: "{location}", inline: true },
                    { name: "🕐 Time", value: "{time}", inline: true },
                    { name: "👥 Hosted By", value: "{host}", inline: true }
                ],
                footer: { text: "We hope to see you there!" }
            },

            staff_application: {
                title: "📝 Staff Applications",
                description: "Interested in joining the staff team? Read the requirements before applying.",
                color: 0x5865F2,
                fields: [
                    { name: "✅ Requirements", value: "Be respectful, active, trustworthy, and familiar with the server rules.", inline: false },
                    { name: "📋 Before Applying", value: "Prepare honest answers and explain how you can contribute to the community.", inline: false },
                    { name: "⏳ Review Process", value: "Applications are reviewed by the staff team. Submission does not guarantee acceptance.", inline: false }
                ],
                footer: { text: "Staff Team • Applications" }
            },

            faq: {
                title: "❓ Frequently Asked Questions",
                description: "Here are some common questions and answers.",
                color: 0x5865F2,
                fields: [
                    { name: "How do I verify?", value: "Use the verification panel and follow the instructions provided.", inline: false },
                    { name: "How do I get support?", value: "Open a support ticket if you need private assistance.", inline: false },
                    { name: "How do I contact staff?", value: "Use the appropriate support channel or ticket category.", inline: false }
                ],
                footer: { text: "If your question is not answered here, contact staff." }
            },

            security_alert: {
                title: "🚨 Security Alert",
                description: "{message}",
                color: 0xED4245,
                fields: [
                    { name: "⚠️ What Happened?", value: "{incident}", inline: false },
                    { name: "🔐 What You Should Do", value: "{action}", inline: false },
                    { name: "🛡️ Status", value: "{status}", inline: true }
                ],
                footer: { text: "Nocthera Security System" },
                timestamp: true
            },

            maintenance: {
                title: "🔧 Scheduled Maintenance",
                description: "{message}",
                color: 0xFEE75C,
                fields: [
                    { name: "🕐 Start", value: "{start}", inline: true },
                    { name: "🕐 Expected End", value: "{end}", inline: true },
                    { name: "📌 Status", value: "{status}", inline: true }
                ],
                footer: { text: "Thank you for your patience." }
            }
        };

        for (const [name, template] of Object.entries(templates)) {
            this.templates.set(name, template);
        }
    }

    get(name) {
        const template = this.templates.get(name);
        return template ? structuredClone(template) : null;
    }

    list() {
        return [...this.templates.keys()];
    }

    register(name, template) {
        if (!name || !template) return false;

        this.templates.set(
            String(name).toLowerCase().trim(),
            structuredClone(template)
        );

        return true;
    }

    remove(name) {
        return this.templates.delete(name);
    }

    render(name, variables = {}) {
        const template = this.get(name);
        if (!template) return null;

        const replace = value => {
            if (typeof value !== "string") return value;

            return value.replace(
                /\{(\w+)\}/g,
                (_, key) =>
                    variables[key] !== undefined
                        ? String(variables[key])
                        : `{${key}}`
            );
        };

        const renderObject = value => {
            if (Array.isArray(value)) return value.map(renderObject);
            if (!value || typeof value !== "object") return replace(value);

            return Object.fromEntries(
                Object.entries(value).map(([key, child]) => [
                    key,
                    renderObject(child)
                ])
            );
        };

        return renderObject(template);
    }
}

export default new EmbedTemplates();
