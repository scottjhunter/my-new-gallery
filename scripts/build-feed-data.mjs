import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TERMS = ["ai", "ethics", "consciousness", "art", "mysticism"];
const MAX_ITEMS = 40;
const MAX_AGE_DAYS = 10;
const MAX_PER_SOURCE = 2;
const MAX_PER_TOPIC = 2;
const MAX_PER_BIGRAM = 2;
const MAX_ENRICH_ITEMS = 24;
const ENRICH_TIMEOUT_MS = 9000;
const REQUEST_DELAY_MS = 400;
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC"
});
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC"
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.resolve(__dirname, "../src/_data/feed.json");
const TITLE_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "in",
  "into", "is", "it", "its", "of", "on", "or", "that", "the", "this", "to", "vs",
  "what", "when", "where", "who", "why", "with", "you", "your", "now", "new",
  "says", "say", "amid", "after", "over", "under", "about", "inside", "review"
]);

const SOURCE_SCORE_RULES = [
  {
    pattern: /(reuters|associated press|ap news|bbc|new york times|washington post|the guardian|npr|the atlantic|financial times|wall street journal|wsj|economist|nature|science|who|world health organization|mit|stanford|harvard|columbia university|oxford|journal)/i,
    score: 24
  },
  {
    pattern: /(the verge|wired|techcrunch|bloomberg|axios|semafor|forbes|time|national geographic|columbia journalism review)/i,
    score: 14
  },
  {
    pattern: /(pr newswire|business wire|globenewswire|newswire)/i,
    score: -12
  },
  {
    pattern: /(insider gaming|ixbt|eteknix)/i,
    score: -10
  }
];
const TERM_LABELS = {
  ai: "AI",
  ethics: "ethics",
  consciousness: "consciousness",
  art: "art",
  mysticism: "mysticism"
};

function combinationsOfTwo(items) {
  const combos = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      combos.push([items[i], items[j]]);
    }
  }
  return combos;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtml(input = "") {
  const decoded = input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

  return decoded
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, "\"")
    .replace(/â€|â€\x9d/g, "\"")
    .replace(/â€“/g, "-")
    .replace(/â€”/g, "-")
    .replace(/â€¦/g, "...")
    .replace(/â€˜/g, "'");
}

function stripTags(input = "") {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanPunctuationSpacing(text = "") {
  return text
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function readTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "i"));
  if (!match) {
    return "";
  }
  return stripTags(decodeHtml(match[1])).trim();
}

function toIsoDate(input = "") {
  if (!input) {
    return null;
  }
  const time = Date.parse(input);
  if (Number.isNaN(time)) {
    return null;
  }
  return new Date(time).toISOString();
}

function formatDate(iso) {
  if (!iso) {
    return "";
  }
  const time = Date.parse(iso);
  if (Number.isNaN(time)) {
    return "";
  }
  return DATE_FORMATTER.format(new Date(time));
}

function parseItemsFromRss(xml = "") {
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return itemBlocks
    .map((block) => {
      const rawTitle = readTag(block, "title");
      const link = readTag(block, "link");
      const description = readTag(block, "description");
      const pubDate = readTag(block, "pubDate");
      const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
      const source = sourceMatch ? stripTags(decodeHtml(sourceMatch[1])).trim() : "Unknown source";
      const title = normalizeHeadline(rawTitle, source);

      return {
        title,
        url: link,
        summary: description,
        source,
        publishedAt: toIsoDate(pubDate)
      };
    })
    .filter((item) => item.title && item.url);
}

function matchedTermsForText(text = "") {
  const normalized = text.toLowerCase();
  return TERMS.filter((term) => normalized.includes(term));
}

function normalizeTitle(title = "") {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(text = "") {
  return new Set(
    normalizeTitle(text)
      .split(" ")
      .filter((token) => token.length >= 4)
      .filter((token) => !TITLE_STOP_WORDS.has(token))
  );
}

function overlapRatio(aSet, bSet) {
  if (!aSet.size || !bSet.size) {
    return 0;
  }
  let overlap = 0;
  for (const token of aSet) {
    if (bSet.has(token)) {
      overlap += 1;
    }
  }
  return overlap / Math.max(1, Math.min(aSet.size, bSet.size));
}

function titleFingerprint(title = "") {
  const tokens = normalizeTitle(title)
    .split(" ")
    .filter((token) => token.length >= 4)
    .filter((token) => !TITLE_STOP_WORDS.has(token));

  const unique = Array.from(new Set(tokens)).sort();
  return unique.slice(0, 10).join("|");
}

function topicKeyFromTitle(title = "") {
  const withoutSource = title.replace(/\s[-|:]\s[^-|:]{2,80}$/, "");
  const tokens = normalizeTitle(withoutSource)
    .split(" ")
    .filter((token) => token.length >= 4)
    .filter((token) => !TITLE_STOP_WORDS.has(token))
    .filter((token) => !TERMS.includes(token));

  if (tokens.length >= 2) {
    return `${tokens[0]} ${tokens[1]}`;
  }
  if (tokens.length === 1) {
    return tokens[0];
  }
  return "";
}

function significantBigrams(title = "") {
  const withoutSource = title.replace(/\s[-|:]\s[^-|:]{2,80}$/, "");
  const tokens = normalizeTitle(withoutSource)
    .split(" ")
    .filter((token) => token.length >= 4)
    .filter((token) => !TITLE_STOP_WORDS.has(token));

  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (TERMS.includes(a) || TERMS.includes(b)) {
      continue;
    }
    bigrams.push(`${a} ${b}`);
  }

  return Array.from(new Set(bigrams));
}

function ageDays(isoDate) {
  if (!isoDate) {
    return null;
  }
  const time = Date.parse(isoDate);
  if (Number.isNaN(time)) {
    return null;
  }
  return (Date.now() - time) / (1000 * 60 * 60 * 24);
}

function sourceScore(source = "") {
  return SOURCE_SCORE_RULES.reduce((score, rule) => {
    if (rule.pattern.test(source)) {
      return score + rule.score;
    }
    return score;
  }, 0);
}

function toSentenceCase(text = "") {
  if (!text) {
    return "";
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatNaturalList(parts = []) {
  const clean = parts.filter(Boolean);
  if (!clean.length) {
    return "";
  }
  if (clean.length === 1) {
    return clean[0];
  }
  if (clean.length === 2) {
    return `${clean[0]} and ${clean[1]}`;
  }
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
}

function hashText(text = "") {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function lowerFirst(text = "") {
  if (!text) {
    return "";
  }
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function stripSourceSuffix(title = "") {
  return title.replace(/\s[-|:]\s[^-|:]{2,80}$/, "").trim();
}

function normalizeHeadline(title = "", source = "") {
  let cleaned = cleanPunctuationSpacing(decodeHtml(title || ""));
  if (!cleaned) {
    return "";
  }

  if (source) {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned
      .replace(new RegExp(`\\s[-|:]\\s${escaped}$`, "i"), "")
      .replace(new RegExp(`\\s\\|\\s${escaped}$`, "i"), "")
      .trim();
  }

  return stripSourceSuffix(cleaned).trim();
}

function titleToReadableSummary(title = "") {
  const clean = cleanPunctuationSpacing(decodeHtml(stripSourceSuffix(title)));
  if (!clean) {
    return "";
  }
  const sentence = clean.replace(/\.+$/g, "").trim();
  if (!sentence) {
    return "";
  }

  if (/^(how)\b/i.test(sentence)) {
    return `Explains ${lowerFirst(sentence)}.`;
  }
  if (/^(why)\b/i.test(sentence)) {
    return `Looks at ${lowerFirst(sentence)}.`;
  }
  if (/^(what)\b/i.test(sentence)) {
    return `Breaks down ${lowerFirst(sentence)}.`;
  }
  if (/^(does|is|are|can|could|should|will|would)\b/i.test(sentence)) {
    return `Examines whether ${lowerFirst(sentence)}.`;
  }
  if (/^(review:)\b/i.test(sentence)) {
    return sentence.replace(/^review:\s*/i, "Reviews ").replace(/\.$/, "") + ".";
  }
  return `${sentence}.`;
}

function stripHtmlForText(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMetaContent(html = "", selectors = []) {
  for (const selector of selectors) {
    const regex = new RegExp(`<meta[^>]+${selector}[^>]*content=["']([^"']+)["'][^>]*>`, "i");
    const match = html.match(regex);
    if (match && match[1]) {
      return cleanPunctuationSpacing(decodeHtml(match[1]));
    }
  }
  return "";
}

function firstSentence(text = "") {
  if (!text) {
    return "";
  }
  const trimmed = text.trim();
  const match = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return conciseText(trimmed, 180).replace(/\.+$/g, "").trim() + ".";
}

function cleanSummaryText(text = "", source = "") {
  let cleaned = cleanPunctuationSpacing(decodeHtml(text));
  if (!cleaned) {
    return "";
  }

  if (source) {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned
      .replace(new RegExp(`\\s[-|]\\s${escaped}$`, "i"), "")
      .replace(new RegExp(`\\s\\|\\s${escaped}$`, "i"), "");
  }

  cleaned = cleaned.replace(/\s[-|]\s(Updated|Live|Opinion)$/i, "");
  return firstSentence(cleaned);
}

async function fetchWithTimeout(url, timeoutMs = ENRICH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "scottjhunter-feed-bot/1.0 (+https://scottjhunter.org)"
      }
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function enrichSummaryFromArticle(item) {
  try {
    const response = await fetchWithTimeout(item.url);
    if (!response.ok) {
      return item;
    }

    const html = await response.text();
    const metaDescription = extractMetaContent(html, [
      'property=["\']og:description["\']',
      'name=["\']description["\']',
      'name=["\']twitter:description["\']'
    ]);

    let candidate = metaDescription;
    if (!candidate || normalizeTitle(candidate).length < 25) {
      const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
      const articleText = stripHtmlForText(articleMatch ? articleMatch[0] : html);
      candidate = firstSentence(articleText);
    }

    const cleaned = cleanSummaryText(candidate, item.source);
    if (!cleaned || normalizeTitle(cleaned).length < 20) {
      return item;
    }

    return {
      ...item,
      summary: conciseText(cleaned, 180)
    };
  } catch {
    return item;
  }
}

async function enrichTopItems(items = []) {
  const result = [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (i >= MAX_ENRICH_ITEMS) {
      result.push(item);
      continue;
    }
    const enriched = await enrichSummaryFromArticle(item);
    result.push(enriched);
  }
  return result;
}

function conciseText(text = "", maxLength = 170) {
  if (!text) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  if (lastSpace < 60) {
    return `${clipped.trimEnd()}...`;
  }
  return `${clipped.slice(0, lastSpace).trimEnd()}...`;
}

function deriveSummary(item, matchedTerms) {
  const normalizedTitle = normalizeTitle(item.title);
  const titleWithoutSource = normalizeTitle(item.title.replace(/\s[-|:]\s[^-|:]{2,80}$/, ""));
  const sourceNormalized = normalizeTitle(item.source || "");
  const raw = cleanPunctuationSpacing(item.summary || "");

  let summary = raw;
  if (summary) {
    summary = summary
      .replace(new RegExp(`^${item.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[-|:]\\s*`, "i"), "")
      .trim();
  }

  const normalizedSummary = normalizeTitle(summary);
  const titleIncluded =
    normalizedSummary.includes(normalizedTitle) ||
    normalizedSummary.includes(titleWithoutSource);
  const titleTokens = tokenSet(item.title);
  const summaryTokens = tokenSet(summary);
  const highTokenOverlap = overlapRatio(titleTokens, summaryTokens) >= 0.8;
  const sourceOnly =
    normalizedSummary === sourceNormalized ||
    normalizedSummary === `${normalizedTitle} ${sourceNormalized}` ||
    normalizedSummary === `${sourceNormalized} ${normalizedTitle}`;

  if (!summary || titleIncluded || highTokenOverlap || sourceOnly || normalizedSummary.length < 25) {
    const rewritten = titleToReadableSummary(item.title);
    if (rewritten) {
      summary = rewritten;
    } else {
      const sourceText = (item.source || "a trusted source").trim();
      const termText = formatNaturalList(matchedTerms.slice(0, 3).map((term) => TERM_LABELS[term] || term)) || "the core themes in this feed";
      const templates = [
        `A concise report from ${sourceText} on ${termText}.`,
        `An overview from ${sourceText} touching on ${termText}.`,
        `${sourceText} examines current developments in ${termText}.`
      ];
      summary = templates[hashText(item.title) % templates.length];
    }
  }

  return conciseText(toSentenceCase(summary), 170);
}

function freshnessScore(isoDate) {
  const age = ageDays(isoDate);
  if (age === null) {
    return -4;
  }
  if (age <= 1) return 24;
  if (age <= 3) return 18;
  if (age <= 7) return 12;
  if (age <= MAX_AGE_DAYS) return 6;
  return -20;
}

function relevanceScore(matchedTerms = []) {
  const count = matchedTerms.length;
  if (count <= 1) return 0;
  if (count === 2) return 26;
  if (count === 3) return 40;
  if (count === 4) return 52;
  return 60;
}

async function fetchGoogleNewsRss(queryTerms) {
  const q = encodeURIComponent(queryTerms.join(" "));
  const url = `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "scottjhunter-feed-bot/1.0 (+https://scottjhunter.org)"
    }
  });

  if (!response.ok) {
    throw new Error(`Google News request failed (${response.status}) for query: ${queryTerms.join(" + ")}`);
  }

  const xml = await response.text();
  return parseItemsFromRss(xml);
}

function dedupeAndFilter(items) {
  const uniqueByUrl = new Map();
  const uniqueByTitle = new Map();
  const uniqueByFingerprint = new Map();
  const overflow = [];

  items.forEach((item) => {
    const text = `${item.title} ${item.summary}`.trim();
    const matches = matchedTermsForText(text);

    if (matches.length < 2) {
      return;
    }

    const entry = {
      ...item,
      matchedTerms: matches,
      titleKey: normalizeTitle(item.title),
      fingerprint: titleFingerprint(item.title),
      topicKey: topicKeyFromTitle(item.title),
      bigrams: significantBigrams(item.title),
      score: relevanceScore(matches) + sourceScore(item.source) + freshnessScore(item.publishedAt)
    };
    entry.summary = deriveSummary(entry, matches);
    entry.publishedDisplay = formatDate(entry.publishedAt);

    const age = ageDays(entry.publishedAt);
    if (age !== null && age > MAX_AGE_DAYS) {
      return;
    }

    const existing = uniqueByUrl.get(item.url);
    if (!existing) {
      uniqueByUrl.set(item.url, entry);
    } else if (entry.score > existing.score) {
      uniqueByUrl.set(item.url, entry);
    }
  });

  Array.from(uniqueByUrl.values()).forEach((entry) => {
    const existing = uniqueByTitle.get(entry.titleKey);
    if (!existing || entry.score > existing.score) {
      uniqueByTitle.set(entry.titleKey, entry);
    }
  });

  Array.from(uniqueByTitle.values()).forEach((entry) => {
    if (!entry.fingerprint) {
      uniqueByFingerprint.set(`${entry.titleKey}|${entry.url}`, entry);
      return;
    }

    const existing = uniqueByFingerprint.get(entry.fingerprint);
    if (!existing || entry.score > existing.score) {
      uniqueByFingerprint.set(entry.fingerprint, entry);
    }
  });

  const ranked = Array.from(uniqueByFingerprint.values())
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const aDate = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bDate = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bDate - aDate;
    });

  const selected = [];
  const sourceCounts = new Map();
  const topicCounts = new Map();
  const bigramCounts = new Map();

  for (const item of ranked) {
    const source = item.source || "Unknown source";
    const used = sourceCounts.get(source) || 0;
    const topic = item.topicKey || "";
    const topicUsed = topic ? (topicCounts.get(topic) || 0) : 0;
    if (used >= MAX_PER_SOURCE) {
      overflow.push(item);
      continue;
    }
    if (topic && topicUsed >= MAX_PER_TOPIC) {
      overflow.push(item);
      continue;
    }
    const exceededBigramCap = (item.bigrams || []).some((bg) => (bigramCounts.get(bg) || 0) >= MAX_PER_BIGRAM);
    if (exceededBigramCap) {
      overflow.push(item);
      continue;
    }
    sourceCounts.set(source, used + 1);
    if (topic) {
      topicCounts.set(topic, topicUsed + 1);
    }
    (item.bigrams || []).forEach((bg) => {
      bigramCounts.set(bg, (bigramCounts.get(bg) || 0) + 1);
    });
    selected.push(item);
    if (selected.length >= MAX_ITEMS) {
      break;
    }
  }

  if (selected.length < MAX_ITEMS && overflow.length) {
    for (const item of overflow) {
      const source = item.source || "Unknown source";
      const used = sourceCounts.get(source) || 0;
      const topic = item.topicKey || "";
      const topicUsed = topic ? (topicCounts.get(topic) || 0) : 0;
      const exceededBigramCap = (item.bigrams || []).some((bg) => (bigramCounts.get(bg) || 0) >= MAX_PER_BIGRAM);

      if (used >= MAX_PER_SOURCE || (topic && topicUsed >= MAX_PER_TOPIC) || exceededBigramCap) {
        continue;
      }

      selected.push(item);
      sourceCounts.set(source, used + 1);
      if (topic) {
        topicCounts.set(topic, topicUsed + 1);
      }
      (item.bigrams || []).forEach((bg) => {
        bigramCounts.set(bg, (bigramCounts.get(bg) || 0) + 1);
      });
      if (selected.length >= MAX_ITEMS) {
        break;
      }
    }
  }

  return selected.slice(0, MAX_ITEMS);
}

async function buildFeedData() {
  const allQueries = combinationsOfTwo(TERMS);
  const collected = [];
  const failures = [];

  for (const query of allQueries) {
    try {
      const items = await fetchGoogleNewsRss(query);
      collected.push(...items);
    } catch (error) {
      failures.push({ query: query.join(" + "), error: String(error.message || error) });
    }
    await sleep(REQUEST_DELAY_MS);
  }

  let feedItems = dedupeAndFilter(collected);
  feedItems = await enrichTopItems(feedItems);

  const payload = {
    generatedAt: new Date().toISOString(),
    generatedDisplay: `${DATE_TIME_FORMATTER.format(new Date())} UTC`,
    retentionDays: MAX_AGE_DAYS,
    maxItems: MAX_ITEMS,
    terms: TERMS,
    queryPairs: allQueries,
    totalItems: feedItems.length,
    failures,
    items: feedItems
  };

  if (payload.totalItems === 0 && payload.failures.length > 0) {
    try {
      const previousRaw = await readFile(OUTPUT_FILE, "utf8");
      const previous = JSON.parse(previousRaw);
      if (Array.isArray(previous.items) && previous.items.length > 0) {
        const refreshed = previous.items.map((item) => {
          const matches =
            Array.isArray(item.matchedTerms) && item.matchedTerms.length
              ? item.matchedTerms
              : matchedTermsForText(`${item.title || ""} ${item.summary || ""}`);
          const legacySummary =
            typeof item.summary === "string" &&
            (
              item.summary.trim().toLowerCase().startsWith("brief on ") ||
              item.summary.trim().toLowerCase().startsWith("covers ") ||
              item.summary.trim().toLowerCase().startsWith("a concise update on ") ||
              item.summary.trim().toLowerCase().startsWith("this piece tracks ") ||
              item.summary.trim().toLowerCase().startsWith("a quick read on ") ||
              item.summary.trim().toLowerCase().startsWith("a concise report from ") ||
              item.summary.trim().toLowerCase().startsWith("an overview from ") ||
              item.summary.trim().toLowerCase().includes(" examines current developments in ")
            );
          const summarySeed = legacySummary ? "" : item.summary;
          return {
            ...item,
            title: normalizeHeadline(item.title, item.source),
            matchedTerms: matches,
            summary: deriveSummary({ ...item, summary: summarySeed }, matches),
            publishedDisplay: formatDate(item.publishedAt)
          };
        });
        payload.items = await enrichTopItems(dedupeAndFilter(refreshed));
        payload.totalItems = payload.items.length;
        payload.generatedAt = previous.generatedAt || payload.generatedAt;
        payload.generatedDisplay = previous.generatedDisplay || payload.generatedDisplay;
        payload.preservedFromPreviousRun = true;
      }
    } catch {
      // No prior file to preserve; keep current payload with failures.
    }
  }

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Feed written to ${OUTPUT_FILE}`);
  console.log(`Items: ${payload.totalItems}`);
  if (failures.length) {
    console.log(`Failures: ${failures.length}`);
  }
}

buildFeedData().catch((error) => {
  console.error(error);
  process.exit(1);
});
