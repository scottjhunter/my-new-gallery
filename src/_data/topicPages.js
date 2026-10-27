const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const excludedTags = new Set(["all", "posts", "post", "blog", "nav"]);

const toSlug = (value = "") => {
  return value
    .toString()
    .replace(/[\'\u2019]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

module.exports = () => {
  const postsDir = path.join(__dirname, "..", "posts");
  if (!fs.existsSync(postsDir)) return [];

  const counts = new Map();
  const files = fs.readdirSync(postsDir).filter((file) => /\.(md|njk)$/.test(file));

  files.forEach((file) => {
    const content = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data } = matter(content);
    const topics = [
      ...(Array.isArray(data.topics) ? data.topics : []),
      data.topic,
      ...(Array.isArray(data.tags) ? data.tags : [])
        .filter((tag) => typeof tag === "string" && !excludedTags.has(tag.toLowerCase())),
    ].filter((topic) => typeof topic === "string")
      .map((topic) => topic.trim())
      .filter(Boolean);

    if (!topics.length) topics.push("General");

    [...new Set(topics)].forEach((topic) => {
      counts.set(topic, (counts.get(topic) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      count,
      slug: toSlug(name),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });
};
