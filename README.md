# Scott's Notebook

Essays and creative work published at https://scottjhunter.org.

## Stack and routes

This project uses Eleventy 3, Nunjucks, Sass, and Netlify. It does not use Astro.
The homepage lists posts; individual essays and poems live under `/blog/`,
with topic pages under `/blog/topics/`. The About page is `/about/`.

The former gallery and prose sections have been retired. Their URLs must fall
through to the ordinary `404.html` response, with HTTP status 404 and no redirect.
Current poems under `/blog/` remain published. Do not add replacement archives,
redirects, or 410 responses for retired sections.

## Development

- Install dependencies: `npm ci`.
- Build from a clean output directory: `npm run build`.
- Serve locally: `npm start`.
- Run the SEO checks after building: `npm run check:seo`.
- Check image and favicon references: `npm run check:assets`.
- Verify production responses: `npm run check:seo -- --live`.

`src/posts/` holds the posts. Both `.md` and `.njk` templates are supported.
Use `tags: [posts]`, a publication date, and a unique trailing-slash permalink.
Store images in `src/images/`; responsive images use the `img` shortcode.
Use the JPG versions of illustrations. Keep PNGs for assets that need them,
such as the decorative favicons. Only assets used by the current site belong
in `src/images/`.

Sass generates `src/_includes/css/` during the build. Compiled styles, site
output, dependencies, local drafts, and review reports are not committed.
GitHub Actions builds the site and checks SEO and assets on every push or PR.

## SEO and hosting

- `src/_data/site.json` defines the canonical origin, `https://scottjhunter.org`.
- `src/_includes/layouts/base.njk` derives canonical and Open Graph URLs from
  that origin and the generated route.
- `src/sitemap.njk` includes indexable pages only. Paginated topic pages are
  included; redirects, the 404 page, and contact confirmations are excluded.
- `src/rss.xml.njk` generates `/feed.xml`; `src/robots.njk` advertises the sitemap.
- `netlify.toml` publishes `_site`, retains permanent domain redirects, and
  enables Pretty URLs. Live HTML pages use trailing slashes; file URLs do not.
- Netlify serves the generated `404.html` for missing paths without a route rule.

Deploy with `npm run deploy:draft` or `npm run deploy:prod` when authorized.
The clean build removes stale generated files before deployment.

Originally based on Tanner Dolby's Eleventy starter. See `LICENSE` for attribution.
