import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TERMS = ["ai", "ethics", "consciousness", "art", "mysticism"];
const MAX_ITEMS = 40;
const MAX_AGE_DAYS = 10;
const MAX_PER_SOURCE = 2;
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
      const title = readTag(block, "title");
      const link = readTag(block, "link");
      const description = readTag(block, "description");
      const pubDate = readTag(block, "pubDate");
      const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
      const source = sourceMatch ? stripTags(decodeHtml(sourceMatch[1])).trim() : "Unknown source";

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

function titleFingerprint(title = "") {
  const tokens = normalizeTitle(title)
    .split(" ")
    .filter((token) => token.length >= 4)
    .filter((token) => !TITLE_STOP_WORDS.has(token));

  const unique = Array.from(new Set(tokens)).sort();
  return unique.slice(0, 10).join("|");
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
      publishedDisplay: formatDate(item.publishedAt),
      matchedTerms: matches,
      titleKey: normalizeTitle(item.title),
      fingerprint: titleFingerprint(item.title),
      score: relevanceScore(matches) + sourceScore(item.source) + freshnessScore(item.publishedAt)
    };

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

  for (const item of ranked) {
    const source = item.source || "Unknown source";
    const used = sourceCounts.get(source) || 0;
    if (used >= MAX_PER_SOURCE) {
      overflow.push(item);
      continue;
    }
    sourceCounts.set(source, used + 1);
    selected.push(item);
    if (selected.length >= MAX_ITEMS) {
      break;
    }
  }

  if (selected.length < MAX_ITEMS && overflow.length) {
    for (const item of overflow) {
      selected.push(item);
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

  const feedItems = dedupeAndFilter(collected);

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
        payload.items = previous.items;
        payload.totalItems = previous.items.length;
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
