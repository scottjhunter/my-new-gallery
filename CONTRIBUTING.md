# Working on Scott's Notebook

Read `README.md` for the current project structure and URL policy.

1. Install the locked dependencies with `npm ci`.
2. Edit source files under `src/`.
3. Run `npm run build`, then `npm run check:seo` and `npm run check:assets`.
4. Review the diff and preserve existing post text and URLs unless a content
   change or URL change was requested.
5. Publish only within the scope authorized by the site owner.

## Content and assets

Posts, including poems, belong in `src/posts/` with the `posts` tag. Inline and
multiline YAML topic lists are supported. Topic pages are generated from those
lists; do not maintain a second manual list of post URLs.

Place images in `src/images/` and provide useful alt text. Add responsive images
with the `img` shortcode in Nunjucks templates. Keep assets used by current posts,
even when an asset's name reflects an older version of the site.

## Routing and indexing

Use `https://scottjhunter.org` and trailing-slash page URLs. Keep domain
canonicalization separate from content redirects. The retired sections must
remain absent and return ordinary 404 responses without redirects.

Set `sitemap: false` on redirect aliases and utility pages. Set `noindex: true`
on pages that should not be indexed. Keep all indexable pages self-canonical.

## Styling

Edit Sass in `src/_includes/sass/`; the build compiles it to the CSS included by
the base layout. Do not edit generated `_site` files. Run a clean build before
publishing to prevent deleted routes from surviving in the output.
