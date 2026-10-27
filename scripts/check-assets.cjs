const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..", "_site");
const origin = "https://scottjhunter.org";
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const referenced = new Set();

function check(value, source) {
  if (!value || /^(?:data:|blob:|#)/i.test(value)) return;
  const url = new URL(value.replace(/&amp;/g, "&"), origin);
  if (url.origin !== origin) return;
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const parts = relative.split("/").filter(Boolean);
  let current = root;
  for (const part of parts) {
    assert(fs.existsSync(current) && fs.statSync(current).isDirectory(), `Missing asset ${relative} in ${source}`);
    assert(fs.readdirSync(current).includes(part), `Missing asset or wrong filename case: ${relative} in ${source}`);
    current = path.join(current, part);
  }
  assert(fs.statSync(current).isFile(), `Asset is not a file: ${relative} in ${source}`);
  referenced.add(relative);
}

for (const file of walk(root).filter((file) => file.endsWith(".html"))) {
  const html = fs.readFileSync(file, "utf8");
  for (const [tag] of html.matchAll(/<(?:img|source|link|meta)\b[^>]*>/gi)) {
    const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)=["']([^"']*)["']/g)].map((match) => [match[1], match[2]]));
    if (/^<(?:img|source)\b/i.test(tag)) {
      check(attrs.src, file);
      for (const entry of (attrs.srcset || "").split(",").filter(Boolean)) check(entry.trim().split(/\s+/)[0], file);
    }
    if (/^<link\b/i.test(tag) && /^(?:icon|apple-touch-icon|manifest|stylesheet)$/.test(attrs.rel || "")) check(attrs.href, file);
    if (["og:image", "twitter:image"].includes(attrs.property || attrs.name)) check(attrs.content, file);
  }
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    if (/\.(?:jpe?g|png|webp|gif|svg|avif)(?:[?#]|$)/i.test(href)) check(href, file);
  }
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, "favicon_data", "site.webmanifest"), "utf8"));
for (const icon of manifest.icons || []) {
  check(new URL(icon.src, `${origin}/favicon_data/site.webmanifest`).href, "site.webmanifest");
}
console.log(`Local asset checks passed: ${referenced.size} referenced files, including image links, social images, responsive sources, and favicons.`);
