/**
 * ============================================================
 * Nocthera v1.1.0
 * NSFW Service - tag-strict multi-provider (bot.js inspired)
 * Providers: redditporn, Gifreels, e621, yande, konachan
 * ============================================================
 */

import logger from "../../core/logger.js";

export const NSFW_TAGS = [
    "anal", "pussy", "ass", "tits", "breasts", "big_breasts", "huge_breasts",
    "nipples", "nude", "nudes", "naked", "spread_legs", "spread_pussy", "gaping",
    "blowjob", "oral", "deepthroat", "facefuck", "handjob", "footjob",
    "paizuri", "titjob", "masturbation", "fingering", "penetration",
    "vaginal", "creampie", "cum", "cum_in_pussy", "cum_in_ass", "cum_on_face",
    "bukkake", "facial", "ahegao", "orgasm", "squirting", "squirt",
    "bondage", "bdsm", "rope", "gagged", "blindfold", "collar", "leash",
    "spanking", "whipping", "domination", "submission", "petplay",
    "tentacle", "tentacles", "monster", "monster_girl",
    "futanari", "futa", "dickgirl",
    "group", "threesome", "gangbang", "orgy",
    "public", "exhibitionism", "outdoor",
    "hentai", "anime", "manga",
    "yuri", "lesbian", "yaoi", "gay", "femboy",
    "milf", "mature", "cougar",
    "furry", "anthro", "kemono",
    "elf", "demon", "succubus", "angel", "witch",
    "maid", "nurse", "schoolgirl", "uniform", "lingerie", "stockings",
    "latex", "leather", "swimsuit", "bikini",
    "arab", "asian", "black", "latina", "pale", "dark_skin", "ebony",
    "blonde", "brunette", "redhead", "pink_hair", "blue_hair",
    "long_hair", "short_hair", "ponytail", "twintails",
    "glasses", "tattoo", "piercing",
    "doggy_style", "doggystyle", "missionary", "cowgirl", "reverse_cowgirl", "standing",
    "from_behind", "against_wall", "on_top", "prone_bone",
    "uncensored", "explicit", "erotic", "sexy", "hot", "nsfw",
    "solo", "duo", "multiple_girls", "1girl", "2girls",
    "male", "female", "crossdressing",
    "pregnant", "lactation",
    "anal_beads", "dildo", "vibrator", "sex_toy",
    "double_penetration", "triple_penetration", "dp",
    "cum_inside", "rimjob", "anilingus", "cunnilingus", "facesitting",
    "feet", "toes", "soles", "foot_fetish",
    "inflation", "hyper", "huge_ass", "thick", "thicc", "bbw",
    "petite", "curvy", "hourglass",
    "kiss", "french_kiss", "tongue", "saliva",
    "sweat", "wet", "oiled", "lube",
    "teen", "college", "amateur", "homemade", "onlyfans",
    "boobs", "booty", "thighs", "legs", "leggings",
    "riding", "joi", "pov", "gangbang",
    "femdom", "massage", "cosplay", "goth", "trans", "titfuck"
];

const TAG_SET = new Set(NSFW_TAGS.map(t => t.toLowerCase()));
export const MODE_KEYWORDS = new Set(["hentai", "3d", "real", "irl", "realistic"]);

const CAT_SUBS = {
    ass: ["ass", "AssAndTitties", "BigBooty", "TheBooty", "BigAssGifs", "pawg", "AssShaking", "GirlsWithBigButts", "asshole"],
    pussy: ["pussy", "WetPussyClub", "PussyLiquor", "LabiaGW", "GodPussy", "Innie", "spreading"],
    boobs: ["boobs", "Boobies", "BigNaturals", "titties", "TittyDrop", "BustyPetite", "boobbouncing"],
    tits: ["boobs", "Boobies", "TittyDrop", "titties"],
    breasts: ["boobs", "BigNaturals", "TittyDrop"],
    blowjob: ["blowjob", "oral", "SuckingCock", "Blowjobs", "deepthroat", "gagging", "facefuck", "GWBlowJob"],
    oral: ["blowjob", "oral", "Blowjobs", "deepthroat"],
    deepthroat: ["deepthroat", "Blowjobs", "gagging", "facefuck"],
    thick: ["chubby", "bbw", "curvy", "thick", "pawg", "GoneWildCurvy"],
    blonde: ["blonde", "blondes", "BlondeGirls", "BlondePAWG", "GoneWild"],
    brunette: ["brunette", "brunettes", "HotBrunettes", "GoneWild"],
    petite: ["petite", "smalltits", "petitegonewild", "TinyTits"],
    asian: ["asian", "AsianGifs", "AsianHotties", "EastAsians", "AsianPorn", "AsianNSFW", "AsiansGoneWild", "RealAsians"],
    milf: ["milf", "MILF", "over30", "cougars", "MilfsLikeitBig", "maturemilf"],
    dp: ["threesome", "dp", "doublePenetration", "SpitRoasted"],
    double_penetration: ["threesome", "dp", "doublePenetration"],
    cosplay: ["cosplay", "cosplaygirls", "nsfwcosplay"],
    leggings: ["leggings", "YogaPants", "girlsinyogapants", "Tight_Leggings"],
    nudes: ["gonewild", "Amateur", "RealGirls", "normalnudes"],
    nude: ["gonewild", "Amateur", "RealGirls", "normalnudes"],
    naked: ["gonewild", "Amateur", "RealGirls"],
    cum: ["cumshots", "facials", "CumSluts", "creampie", "CumFetish"],
    creampie: ["creampie", "creampies", "internalgw"],
    facial: ["facials", "CumSluts", "FacialFun"],
    anal: ["anal", "AnalGW", "AnalLovers", "asshole", "analcreampie", "analgonewild"],
    feet: ["feet", "VerifiedFeet", "FootFetish"],
    bondage: ["bondage", "BDSMGW", "shibari", "tiedupgirls"],
    lesbian: ["lesbians", "dykesgonewild", "girlskissing"],
    latina: ["latinas", "latina", "LatinasGW", "LatinaNSFW"],
    arab: ["ArabGoneWild", "MiddleEasternHotties", "IranianWomen", "TurkishGoneWild", "ArabGirls"],
    teen: ["legalteens", "barelylegalteens"],
    college: ["collegesluts", "CollegeAmateurs"],
    riding: ["cowgirl", "Riding"],
    cowgirl: ["cowgirl", "Riding"],
    squirt: ["squirting", "Squirting", "squirtinggirls"],
    squirting: ["squirting", "Squirting"],
    goth: ["gothsluts", "altgonewild"],
    trans: ["tgirls", "TransGoneWild"],
    ebony: ["ebony", "EbonyGW", "BlackGirls", "EbonyNSFW"],
    black: ["ebony", "EbonyGW", "BlackGirls"],
    thighs: ["ThickThighs", "thighs"],
    lingerie: ["lingerie", "LingerieGW"],
    outdoor: ["PublicFlashing", "Exhibitionistfun", "RealPublicNudity"],
    public: ["PublicFlashing", "Exhibitionistfun", "RealPublicNudity"],
    doggystyle: ["doggystyle", "pronebone"],
    doggy_style: ["doggystyle", "pronebone"],
    joi: ["JOI", "JOI_NSFW"],
    hentai: ["hentai", "ecchi", "rule34", "hentaivideos"],
    redhead: ["redheads", "Ginger", "GoneWild"],
    ahegao: ["ahegao", "AhegaoGirls"],
    bbw: ["BBW", "BBWGW", "GoneWildPlus"],
    pov: ["POV", "POVBlowJobs", "POV_Porn"],
    gangbang: ["gangbang"],
    handjob: ["handjobs", "HJGW"],
    femdom: ["Femdom", "femdomgonewild"],
    massage: ["massage", "EroticMassage"],
    latex: ["latex", "LatexGW"],
    facesitting: ["facesitting", "FaceSitting"],
    rimjob: ["rimjob", "Rimjob"],
    amateur: ["Amateur", "gonewild", "RealGirls", "homemadexxx"],
    threesome: ["Threesome", "threesome"]
};

const GIFREELS_CAT_TAG = {
    ass: "ass", pussy: "pussy", boobs: "boobs", blowjob: "blowjob", thick: "thick",
    blonde: "blonde", brunette: "brunette", petite: "petite", asian: "asian",
    redhead: "redhead", milf: "milf", dp: "double-penetration", cosplay: "cosplay",
    leggings: "leggings", nudes: "nude", cum: "cumshot", anal: "anal", feet: "feet",
    bondage: "bondage", lesbian: "lesbian", latina: "latina", teen: "teen",
    riding: "riding", squirt: "squirting", goth: "goth", trans: "tgirl", ebony: "ebony",
    thighs: "thighs", lingerie: "lingerie", outdoor: "outdoor", doggystyle: "doggystyle",
    joi: "joi", hentai: "hentai", bbw: "bbw", titfuck: "titfuck", handjob: "handjob",
    gangbang: "gangbang", creampie: "creampie", pov: "pov", massage: "massage",
    ahegao: "ahegao", latex: "latex", femdom: "femdom", facesitting: "facesitting",
    rimjob: "rimjob"
};

export function isValidTag(tag) {
    if (!tag || typeof tag !== "string") return false;
    return TAG_SET.has(tag.toLowerCase().replace(/[^a-z0-9_]/g, ""));
}

export function normalizeTag(tag) {
    return String(tag || "").toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function listTags() {
    return [...NSFW_TAGS].sort();
}

export function parsePrefixCommand(content) {
    if (!content?.startsWith("!")) return null;
    const parts = content.slice(1).trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!parts.length) return null;
    let mode = "real";
    const tags = [];
    for (const p of parts) {
        const cleaned = normalizeTag(p);
        if (!cleaned) continue;
        if (MODE_KEYWORDS.has(cleaned) || cleaned === "3d") {
            if (cleaned === "irl" || cleaned === "realistic" || cleaned === "real") mode = "real";
            else if (cleaned === "3d") mode = "3d";
            else if (cleaned === "hentai") mode = "hentai";
            continue;
        }
        if (cleaned.length >= 2) tags.push(cleaned);
    }
    if (!tags.length) return null;
    return { tags, mode };
}

function primarySubsForTags(tags) {
    const set = new Set();
    for (const t of tags) {
        const list = CAT_SUBS[t] || CAT_SUBS[t.replace(/_/g, "")] || [];
        for (const s of list) set.add(s);
    }
    return [...set];
}

function relevanceKeywords(tags) {
    const kws = new Set();
    for (const t of tags) {
        kws.add(t.toLowerCase());
        kws.add(t.replace(/_/g, " "));
        if (t === "ass") { kws.add("butt"); kws.add("booty"); }
        if (t === "boobs" || t === "tits" || t === "breasts") { kws.add("boob"); kws.add("tit"); kws.add("breast"); }
        if (t === "pussy") { kws.add("vagina"); kws.add("labia"); kws.add("wet"); }
        if (t === "blowjob" || t === "oral") { kws.add("suck"); kws.add("bj"); kws.add("throat"); kws.add("cock"); }
        if (t === "anal") { kws.add("anal"); kws.add("buttplug"); kws.add("asshole"); kws.add("in the ass"); kws.add("assfuck"); }
        if (t === "arab") { kws.add("arab"); kws.add("arabic"); kws.add("middle eastern"); kws.add("iranian"); kws.add("turkish"); kws.add("egyptian"); }
        if (t === "milf") { kws.add("milf"); kws.add("mature"); kws.add("mom"); }
        if (t === "asian") { kws.add("asian"); kws.add("japanese"); kws.add("korean"); kws.add("chinese"); }
        if (t === "latina") { kws.add("latina"); kws.add("hispanic"); kws.add("mexican"); }
        if (t === "ebony" || t === "black") { kws.add("ebony"); kws.add("black"); }
    }
    return [...kws];
}

function scoreRelevance(post, tags, keywords) {
    const text = `${post.title || ""} ${post.source || ""} ${(post.tags || []).join(" ")}`.toLowerCase();
    let score = 0;
    for (const t of tags) {
        const forms = [t, t.replace(/_/g, " ")];
        if (forms.some(f => text.includes(f))) score += 5;
    }
    for (const kw of keywords) {
        if (text.includes(kw)) score += 1;
    }
    const allMatch = tags.every(t => text.includes(t) || text.includes(t.replace(/_/g, " ")));
    if (allMatch && tags.length > 1) score += 15;
    return score;
}

function pickBest(candidates, tags, keywords) {
    if (!candidates.length) return null;
    const scored = candidates
        .map(p => ({ p, s: scoreRelevance(p, tags, keywords) }))
        .sort((a, b) => b.s - a.s);

    if (tags.length > 1) {
        const multi = scored.filter(x => x.s >= 15);
        if (multi.length) return multi[Math.floor(Math.random() * Math.min(multi.length, 8))].p;
        const act = tags[tags.length - 1];
        const actHits = scored.filter(x => {
            const text = `${x.p.title || ""} ${x.p.source || ""}`.toLowerCase();
            return text.includes(act);
        });
        if (actHits.length) return actHits[Math.floor(Math.random() * Math.min(actHits.length, 10))].p;
    }

    const relevant = scored.filter(x => x.s > 0);
    const pool = relevant.length ? relevant.slice(0, 12) : scored.slice(0, 8);
    return pool[Math.floor(Math.random() * pool.length)].p;
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchText(url, headers = {}) {
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": UA, Accept: "*/*", ...headers },
            signal: AbortSignal.timeout(12000)
        });
        if (!res.ok) return null;
        return await res.text();
    } catch { return null; }
}

async function fetchJson(url, headers = {}) {
    const text = await fetchText(url, { Accept: "application/json", ...headers });
    if (!text || text.trim().startsWith("<")) return null;
    try { return JSON.parse(text); } catch { return null; }
}

function classifyMedia(url, rtype) {
    if (!url) return null;
    if (/\.gifv(\?|$)/i.test(url)) return "gif";
    if (/(?:i|thumbs\d*)\.redgifs\.com\//i.test(url) && /\.mp4/i.test(url)) return "mp4";
    if (/redgifs\.com/i.test(url)) return "redgif";
    if (/\.mp4(\?|$)/i.test(url) || /\.webm(\?|$)/i.test(url)) return "mp4";
    if (/\.gif(\?|$)/i.test(url) || rtype === "gif" || rtype === "animatedgif") return "gif";
    if (/\.(jpg|jpeg|png|webp)(\?|$)/i.test(url) || rtype === "image") return "image";
    if (/i\.(redd|imgur)\.it/i.test(url)) return "image";
    return null;
}

async function collectRedditPorn(subs, seen, limit = 50) {
    const subList = (Array.isArray(subs) ? subs : [subs]).filter(Boolean).slice(0, 10);
    if (!subList.length) return [];
    const sort = ["hot", "new", "top"][Math.floor(Math.random() * 3)];
    const qs = new URLSearchParams({
        page: "1", limit: String(limit), subs: subList.join(","),
        sort, dir: "desc", t: "month", media: "image,gif,gallery,video"
    });
    const data = await fetchJson(`https://redditporn.com/ajax.php?${qs}`, {
        Referer: "https://redditporn.com/",
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json, text/javascript, */*; q=0.01"
    });
    const posts = data?.posts || data?.data || data?.items || (Array.isArray(data) ? data : []);
    if (!Array.isArray(posts)) return [];

    const out = [];
    for (const p of posts) {
        const domain = p.domain || "";
        let url = p.url || p.mp4;
        let videoUrl = null;
        let type = null;

        if (domain === "v.redd.it" || /v\.redd\.it/i.test(url || "")) continue;

        let embedUrl = null;
        if (domain === "redgifs.com" || /redgifs\.com/i.test(url || "")) {
            // Prefer watch page for Discord unfurl when file is too large
            const watchMatch = (url || "").match(/redgifs\.com\/(?:watch|ifr)\/([a-zA-Z0-9]+)/i);
            if (watchMatch) {
                embedUrl = `https://www.redgifs.com/watch/${watchMatch[1]}`;
            } else if (p.mp4) {
                const idMatch = String(p.mp4).match(/redgifs\.com\/([a-zA-Z0-9]+)(?:[.-]|$)/i);
                if (idMatch) embedUrl = `https://www.redgifs.com/watch/${idMatch[1]}`;
            }
            if (p.mp4) {
                videoUrl = String(p.mp4).replace(/\.hd\.mp4(\?|$)/i, ".mp4$1");
                url = url || videoUrl;
                type = "mp4";
            } else if (url) {
                type = "redgif";
                if (!embedUrl) embedUrl = url;
            } else continue;
        } else if (p.mp4 && /\.mp4/i.test(p.mp4)) {
            videoUrl = p.mp4;
            url = url || p.mp4;
            type = "mp4";
        } else if (Array.isArray(p.gallery) && p.gallery[0]?.url) {
            url = p.gallery[0].url;
            type = classifyMedia(url) || "image";
        } else {
            type = classifyMedia(url, p.type);
            if (!type) continue;
        }

        if (seen?.has(url) || (videoUrl && seen?.has(videoUrl))) continue;

        out.push({
            id: String(p.id || url),
            url,
            videoUrl,
            type,
            embedUrl,
            title: p.title || "",
            source: `redditporn/${p.subreddit || subList[0]}`,
            score: 0,
            tags: [p.subreddit || subList[0]].filter(Boolean),
            rating: "e"
        });
    }
    return out;
}

async function collectGifreels(tag, seen) {
    const gfTag = GIFREELS_CAT_TAG[tag];
    if (!gfTag) return [];
    const items = [];
    const dedup = new Set();
    for (let page = 1; page <= 2; page++) {
        const pageUrl = page === 1
            ? `https://gifreels.com/tag/${encodeURIComponent(gfTag)}/`
            : `https://gifreels.com/tag/${encodeURIComponent(gfTag)}/?page=${page}`;
        const html = await fetchText(pageUrl, { Accept: "text/html" });
        if (!html) break;
        const matches = [...html.matchAll(/href="\/@([^/]+)\/post\/([A-Za-z0-9_-]+)"/g)];
        for (const m of matches) {
            if (dedup.has(m[2])) continue;
            dedup.add(m[2]);
            items.push({ slug: m[2], author: m[1] });
        }
        if (!matches.length) break;
    }
    if (!items.length) return [];
    const shuffled = items.sort(() => Math.random() - 0.5).slice(0, 15);
    const out = [];
    for (const item of shuffled) {
        const videoUrl = `https://xcdn.tv/cdn/storage/production/gifreels/post/${item.slug}/gif.mp4`;
        if (seen?.has(videoUrl)) continue;
        out.push({
            id: item.slug,
            url: videoUrl,
            videoUrl,
            type: "mp4",
            title: `${tag} • gifreels`,
            source: "gifreels",
            score: 0,
            tags: [tag],
            rating: "e"
        });
    }
    return out;
}

function pickImageUrl(post) {
    const candidates = [
        post.sample_url, post.file_url, post.preview_url,
        post?.file?.url, post?.sample?.url, post?.preview?.url
    ].filter(Boolean);
    for (const u of candidates) {
        if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(u)) return u;
    }
    return candidates[0] || null;
}

function normalizeBooru(post, source) {
    const url = pickImageUrl(post);
    if (!url) return null;
    let tags = [];
    if (typeof post.tags === "string") tags = post.tags.split(" ").filter(Boolean);
    else if (post.tags && typeof post.tags === "object" && !Array.isArray(post.tags)) {
        for (const arr of Object.values(post.tags)) if (Array.isArray(arr)) tags.push(...arr);
    } else if (Array.isArray(post.tags)) {
        tags = post.tags.map(t => typeof t === "string" ? t : t?.name).filter(Boolean);
    }
    const type = /\.gif/i.test(url) ? "gif" : "image";
    return {
        id: post.id, url, type, title: "", source,
        score: typeof post.score === "object" ? (post.score?.total ?? 0) : (post.score ?? 0),
        tags: tags.slice(0, 20), rating: post.rating || "e"
    };
}

async function fromYande(tagQuery) {
    const data = await fetchJson(`https://yande.re/post.json?tags=${encodeURIComponent(tagQuery)}+rating:e&limit=40`);
    if (!Array.isArray(data) || !data.length) return null;
    const valid = data.map(p => normalizeBooru(p, "yande.re")).filter(Boolean);
    return valid.length ? valid[Math.floor(Math.random() * valid.length)] : null;
}

async function fromKonachan(tagQuery) {
    const data = await fetchJson(`https://konachan.com/post.json?tags=${encodeURIComponent(tagQuery)}+rating:e&limit=40`);
    if (!Array.isArray(data) || !data.length) return null;
    const valid = data.map(p => normalizeBooru(p, "konachan")).filter(Boolean);
    return valid.length ? valid[Math.floor(Math.random() * valid.length)] : null;
}

async function fromE621(tagQuery) {
    const data = await fetchJson(`https://e621.net/posts.json?tags=${encodeURIComponent(tagQuery)}+rating:e+-young+-loli+-shota&limit=40`);
    const posts = data?.posts;
    if (!Array.isArray(posts) || !posts.length) return null;
    const valid = posts.map(p => normalizeBooru(p, "e621")).filter(Boolean);
    return valid.length ? valid[Math.floor(Math.random() * valid.length)] : null;
}

function booruQueries(tags, mode) {
    const base = tags.join(" ");
    const q = [base];
    if (mode === "3d") q.unshift(`${base} 3d`, `${base} cgi`);
    if (mode === "hentai") q.push(`${base} anime`);
    for (const t of tags) q.push(t);
    const seen = new Set();
    return q.filter(x => { if (seen.has(x)) return false; seen.add(x); return true; });
}


class NsfwService {
    constructor() {
        this.cooldowns = new Map();
        this.hourly = new Map();
        this.seen = new Map();
    }

    getSeen(guildId) {
        if (!this.seen.has(guildId)) this.seen.set(guildId, new Set());
        const s = this.seen.get(guildId);
        if (s.size > 3000) {
            this.seen.set(guildId, new Set([...s].slice(-1500)));
            return this.seen.get(guildId);
        }
        return s;
    }

    checkCooldown(guildId, userId, seconds) {
        if (!seconds || seconds <= 0) return 0;
        const key = `${guildId}:${userId}`;
        const now = Date.now();
        const last = this.cooldowns.get(key) || 0;
        const remaining = Math.ceil((last + seconds * 1000 - now) / 1000);
        if (remaining > 0) return remaining;
        this.cooldowns.set(key, now);
        return 0;
    }

    checkHourlyLimit(guildId, userId, max) {
        if (!max || max <= 0) return 0;
        const key = `${guildId}:${userId}`;
        const now = Date.now();
        let entry = this.hourly.get(key);
        if (!entry || now > entry.reset) {
            entry = { count: 0, reset: now + 3600_000 };
            this.hourly.set(key, entry);
        }
        if (entry.count >= max) return Math.ceil((entry.reset - now) / 1000);
        entry.count += 1;
        return 0;
    }

    async fetchImage(tags, mode = "real", guildId = "global") {
        const tagList = Array.isArray(tags)
            ? tags.map(normalizeTag).filter(Boolean)
            : [normalizeTag(tags)];
        if (!tagList.length) return null;

        const seen = this.getSeen(guildId);
        const keywords = relevanceKeywords(tagList);

        if (mode === "real") {
            const primary = primarySubsForTags(tagList);
            const candidates = [];

            if (primary.length) {
                try {
                    candidates.push(...await collectRedditPorn(primary, seen, 50));
                } catch (e) {
                    logger.warn(`redditporn: ${e?.message}`);
                }
            }

            for (const t of tagList) {
                try {
                    candidates.push(...await collectGifreels(t, seen));
                } catch (e) {
                    logger.warn(`gifreels ${t}: ${e?.message}`);
                }
            }

            if (candidates.length) {
                const best = pickBest(candidates, tagList, keywords);
                if (best) {
                    seen.add(best.url);
                    if (best.videoUrl) seen.add(best.videoUrl);
                    best.mode = mode;
                    return best;
                }
            }

            for (const q of booruQueries(tagList, "real")) {
                for (const fn of [fromE621, fromKonachan, fromYande]) {
                    try {
                        const img = await fn(q);
                        if (img) { img.mode = mode; return img; }
                    } catch { /* */ }
                }
            }
        }

        if (mode === "hentai") {
            const hSubs = CAT_SUBS.hentai || ["hentai", "rule34"];
            try {
                const batch = await collectRedditPorn(hSubs, seen, 40);
                if (batch.length) {
                    const best = pickBest(batch, tagList, keywords);
                    if (best) {
                        seen.add(best.url);
                        best.mode = mode;
                        return best;
                    }
                }
            } catch { /* */ }

            for (const q of booruQueries(tagList, "hentai")) {
                for (const fn of [fromYande, fromKonachan, fromE621]) {
                    try {
                        const img = await fn(q);
                        if (img) { img.mode = mode; return img; }
                    } catch { /* */ }
                }
            }
        }

        if (mode === "3d") {
            for (const q of booruQueries(tagList, "3d")) {
                for (const fn of [fromE621, fromYande, fromKonachan]) {
                    try {
                        const img = await fn(q);
                        if (img) { img.mode = mode; return img; }
                    } catch { /* */ }
                }
            }
        }

        const act = tagList[tagList.length - 1];
        const actSubs = CAT_SUBS[act];
        if (actSubs?.length) {
            try {
                const batch = await collectRedditPorn(actSubs, seen, 40);
                if (batch.length) {
                    const best = pickBest(batch, tagList, keywords);
                    if (best) {
                        seen.add(best.url);
                        best.mode = mode;
                        return best;
                    }
                }
            } catch { /* */ }
        }

        logger.warn(`NSFW no match for: ${tagList.join(" ")} (${mode})`);
        return null;
    }
}

const nsfwService = new NsfwService();
export default nsfwService;
