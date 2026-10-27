const { connectLambda, getStore } = require("@netlify/blobs");

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  },
  body: JSON.stringify(body),
});

const sanitizePath = (value = "") => {
  const trimmed = String(value).trim();
  if (!trimmed) return "";

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return normalized.replace(/\/+$/, "") || "/";
};

const keyFromPath = (pathValue) => {
  // Keep the essay's existing reactions when its public URL changes.
  const storedPath = pathValue === "/blog/on-timing-and-delivery"
    ? "/blog/the-only-real-thing-here-is-the-dog"
    : pathValue;
  return `post_${storedPath.replace(/[^a-z0-9_-]/gi, "_")}`;
};

const normalizeCounts = (raw) => {
  if (!raw) return { up: 0, down: 0 };

  try {
    const parsed = JSON.parse(raw);
    const up = Number(parsed.up || 0);
    const down = Number(parsed.down || 0);

    return {
      up: Number.isFinite(up) && up >= 0 ? up : 0,
      down: Number.isFinite(down) && down >= 0 ? down : 0,
    };
  } catch {
    const legacyCount = Number(raw || 0);

    return {
      up: Number.isFinite(legacyCount) && legacyCount >= 0 ? legacyCount : 0,
      down: 0,
    };
  }
};

const withScore = (counts) => ({
  ...counts,
  count: counts.up,
  total: counts.up + counts.down,
  score: counts.up - counts.down,
});

const parseRequest = (event) => {
  if (event.httpMethod === "GET") {
    return {
      path: sanitizePath(event.queryStringParameters?.path || ""),
      reaction: "",
    };
  }

  if (event.body) {
    try {
      const parsed = JSON.parse(event.body);
      return {
        path: sanitizePath(parsed.path || ""),
        reaction: parsed.reaction === "down" ? "down" : "up",
      };
    } catch {
      return { path: "", reaction: "" };
    }
  }

  return { path: "", reaction: "" };
};

exports.handler = async (event) => {
  try {
    connectLambda(event);
    const store = getStore("blog-likes");
    const { path: pathValue, reaction } = parseRequest(event);

    if (!pathValue) return json(400, { error: "Missing or invalid path" });

    const key = keyFromPath(pathValue);
    const raw = await store.get(key);
    const counts = normalizeCounts(raw);

    if (event.httpMethod === "GET") {
      return json(200, withScore(counts));
    }

    if (event.httpMethod === "POST") {
      const next = {
        ...counts,
        [reaction]: counts[reaction] + 1,
      };
      await store.set(key, JSON.stringify(next));
      return json(200, withScore(next));
    }

    return json(405, { error: "Method not allowed" });
  } catch (error) {
    return json(500, { error: "Like service failed" });
  }
};
