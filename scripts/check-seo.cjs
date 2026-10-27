const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const https = require("node:https");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "_site");
const origin = "https://scottjhunter.org";
const retired = /^\/(gallery|prose)(?:\/|$)/i;
const read = (file) => fs.readFileSync(file, "utf8");
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)=["']([^"']*)["']/g)]
  .map((match) => [match[1], match[2]]));
const head = (html) => {
  const tags = [...html.matchAll(/<(?:link|meta)\b[^>]*>/gi)].map((match) => attrs(match[0]));
  return {
    canonical: tags.find((tag) => tag.rel === "canonical")?.href,
    og: tags.find((tag) => tag.property === "og:url")?.content,
    noindex: tags.some((tag) => tag.name === "robots" && /noindex/i.test(tag.content || "")),
  };
};
const targetFile = (pathname) => path.join(output, decodeURIComponent(pathname),
  pathname.endsWith("/") ? "index.html" : "");
const route = (file) => "/" + path.relative(output, file).split(path.sep).join("/")
  .replace(/(?:^|\/)index\.html$/, (match) => match.startsWith("/") ? "/" : "");

const config = read(path.join(root, "netlify.toml"));
const redirects = config.split("[[redirects]]").slice(1).map((block) => ({
  from: block.match(/^\s*from\s*=\s*"([^"]+)"/m)?.[1],
  to: block.match(/^\s*to\s*=\s*"([^"]+)"/m)?.[1],
  status: Number(block.match(/^\s*status\s*=\s*(\d+)/m)?.[1] || 301),
}));

async function main() {
  assert.equal(JSON.parse(read(path.join(root, "src/_data/site.json"))).url, origin);
  for (const folder of ["gallery", "prose"]) {
    assert(!fs.existsSync(path.join(output, folder)), `Retired output exists: ${folder}`);
    assert(!fs.existsSync(path.join(root, "src", folder)), `Retired source exists: ${folder}`);
    for (const ext of ["njk", "md", "html"]) {
      assert(!fs.existsSync(path.join(root, "src", `${folder}.${ext}`)), `Retired route exists: ${folder}.${ext}`);
      assert(!fs.existsSync(path.join(output, `${folder}.${ext}`)), `Retired static file exists: ${folder}.${ext}`);
    }
  }
  assert(!fs.existsSync(path.join(output, "_redirects")), "Audit additional _redirects rules before publishing");
  for (const redirect of redirects) {
    for (const value of [redirect.from, redirect.to]) {
      assert(value, "Incomplete redirect rule");
      assert(!retired.test(new URL(value, origin).pathname), `Retired content redirect: ${value}`);
    }
    assert.notEqual(redirect.status, 410, "Gone responses are not permitted");
  }

  const htmlFiles = walk(output).filter((file) => file.endsWith(".html"));
  const indexable = new Set();
  for (const file of htmlFiles) {
    const html = read(file);
    const pathname = route(file);
    const metadata = head(html);
    assert(!retired.test(pathname), `Retired page: ${pathname}`);
    assert.equal(new URL(metadata.canonical).origin, origin, `Canonical origin: ${pathname}`);
    assert.equal(metadata.og, metadata.canonical, `Open Graph URL: ${pathname}`);
    if (!metadata.noindex) {
      assert.equal(metadata.canonical, origin + pathname, `Self canonical: ${pathname}`);
      assert(pathname.endsWith("/"), `Page trailing slash: ${pathname}`);
      indexable.add(metadata.canonical);
    }
    for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
      const href = attrs(match[0]).href;
      if (!href || !/^(?:\/|https?:\/\/scottjhunter\.org(?:\/|$))/.test(href)) continue;
      const linked = new URL(href, origin);
      if (linked.origin !== origin) continue;
      assert(!retired.test(linked.pathname), `Stale link in ${pathname}: ${href}`);
      const direct = targetFile(linked.pathname);
      const directory = path.join(output, decodeURIComponent(linked.pathname), "index.html");
      const isRedirect = redirects.some((rule) => rule.from === linked.pathname);
      assert(fs.existsSync(direct) || fs.existsSync(directory) || isRedirect,
        `Broken internal link in ${pathname}: ${href}`);
    }
  }

  const sitemap = read(path.join(output, "sitemap.xml"));
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(new Set(urls).size, urls.length, "Duplicate sitemap entries");
  assert.deepEqual(new Set(urls), indexable, "Sitemap must contain exactly the live indexable pages");
  for (const url of urls) {
    const parsed = new URL(url);
    assert.equal(parsed.origin, origin);
    assert(!parsed.search && !parsed.hash && !retired.test(parsed.pathname));
    assert(fs.existsSync(targetFile(parsed.pathname)), `Missing sitemap target: ${url}`);
    assert(!redirects.some((rule) => rule.from === parsed.pathname), `Sitemap redirect: ${url}`);
  }
  for (const name of ["feed.xml", "robots.txt"]) {
    const text = read(path.join(output, name));
    assert(!/https?:\/\/www\.scottjhunter\.org|http:\/\/scottjhunter\.org|\/(gallery|prose)\//i.test(text),
      `Noncanonical or retired URL in ${name}`);
  }
  assert(head(read(path.join(output, "404.html"))).noindex, "404 page must be noindex");
  console.log(`Local SEO checks passed: ${urls.length} indexable URLs; no retired routes, redirects, or internal links.`);
  if (!process.argv.includes("--live")) return;

  const results = [];
  const check = async (url, expected, canonical) => {
    const response = await request(url);
    results.push({ url, status: response.status, location: response.location || null });
    assert.equal(response.status, expected, `${url}: expected ${expected}, got ${response.status}`);
    if (expected === 404) {
      assert(!response.location, `Retired URL redirects: ${url}`);
      assert(head(response.body).noindex, `Ordinary 404 page missing: ${url}`);
    }
    if (canonical) {
      const metadata = head(response.body);
      assert.equal(metadata.canonical, canonical, `Live canonical: ${url}`);
      assert.equal(metadata.og, canonical, `Live Open Graph URL: ${url}`);
      assert(!metadata.noindex && !/noindex/i.test(response.robots || ""), `Nonindexable sitemap URL: ${url}`);
    }
    return response;
  };
  await pool(urls, (url) => check(url, 200, url));
  const retiredPaths = ["/gallery", "/gallery/example", "/gallery/nested/example", "/gallery/index.html",
    "/prose", "/prose/sixty-pulses", "/prose/the-seeker", "/prose/the-cyclewoman",
    "/prose/the-lady-of-the-garden", "/prose/the-mad-poet", "/prose/unknown/nested"]
    .flatMap((url) => [url, url + "/"]);
  await pool(retiredPaths, (pathname) => check(origin + pathname, 404));
  for (const alternative of ["http://scottjhunter.org/", "http://www.scottjhunter.org/", "https://www.scottjhunter.org/"]) {
    let current = alternative;
    for (let hop = 0; hop < 4; hop++) {
      const response = await request(current);
      results.push({ url: current, status: response.status, location: response.location || null });
      if (response.status === 200) { assert.equal(current, origin + "/"); break; }
      assert([301, 308].includes(response.status), `Domain redirect must be permanent: ${current}`);
      assert(response.location, `Missing domain redirect Location: ${current}`);
      current = new URL(response.location, current).href;
      assert(hop < 3, `Domain redirect loop: ${alternative}`);
    }
  }
  for (const pathname of ["/about/", "/blog/on-timing-and-delivery/", "/blog/topics/ai/"]) {
    const response = await check(origin + pathname.slice(0, -1), 301);
    assert.equal(new URL(response.location, origin).href, origin + pathname);
  }
  for (const pathname of ["/blog/the-lady-of-the-garden/", "/blog/the-cyclewoman/", "/blog/the-mad-poet/"]) {
    await check(origin + pathname, 200, origin + pathname);
  }
  const liveSitemap = await request(origin + "/sitemap.xml");
  assert.equal(liveSitemap.status, 200);
  assert.deepEqual([...liveSitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]), urls);
  fs.mkdirSync(path.join(root, "reports"), { recursive: true });
  fs.writeFileSync(path.join(root, "reports/seo-clean-break-verification.json"),
    JSON.stringify({ checkedAt: new Date().toISOString(), indexableUrls: urls.length,
      retiredUrls: retiredPaths.length, results }, null, 2));
  console.log(`Production SEO checks passed: all ${urls.length} sitemap URLs return 200; all ${retiredPaths.length} retired URL variants return direct 404; domain and slash redirects preserved.`);
}

function request(url) {
  return new Promise((resolve, reject) => {
    const transport = url.startsWith("https:") ? https : http;
    const req = transport.get(url, { headers: { "user-agent": "ScottNotebook-SEO-Verification/1.0" } }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body,
        location: res.headers.location, robots: res.headers["x-robots-tag"] }));
      res.on("error", reject);
    });
    req.setTimeout(20000, () => req.destroy(new Error(`Request timed out: ${url}`)));
    req.on("error", reject);
  });
}

async function pool(items, run) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(6, items.length) }, async () => {
    while (next < items.length) await run(items[next++]);
  }));
}

main().catch((error) => {
  console.error(error.message || error.errors?.map((cause) => cause.message).join("; ") || String(error));
  process.exitCode = 1;
});
