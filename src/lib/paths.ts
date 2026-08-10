// Base-aware path helpers.
//
// This site deploys to a GitHub Pages project repo, so it is served from the
// `/blog` subpath and every internal path must carry that prefix. Astro
// prefixes its OWN bundled assets automatically, but not values you write by
// hand: `<a href>`, `<img src>`, and anything referenced out of `public/`.
//
// `import.meta.env.BASE_URL` is `/blog` with NO trailing slash (verified
// against the build output), so naive template joining produces either a
// missing prefix or a `//` protocol-relative path once `base` is removed.
// Always go through withBase().
//
// Docs: https://docs.astro.build/en/reference/configuration-reference/#base

/** Configured base with any trailing slashes removed: '/blog', or '' when unset. */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/**
 * Prefix a site-root-relative path with the configured base.
 *
 * withBase('/posts/kql-hunting') -> '/blog/posts/kql-hunting'
 *
 * Safe across the eventual custom-domain migration: once `base` is dropped from
 * astro.config.mjs, BASE becomes '' and this returns the path unchanged.
 */
export function withBase(path: string): string {
	return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Absolute URL for canonical tags, feeds and social metadata. */
export function absoluteUrl(path: string, site: URL | undefined): string {
	if (!site) {
		throw new Error('`site` must be set in astro.config.mjs to build absolute URLs');
	}
	return new URL(withBase(path), site).href;
}
