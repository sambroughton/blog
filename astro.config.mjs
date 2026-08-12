// @ts-check
import { defineConfig } from 'astro/config';

import astroExpressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Declared once and used for both `base` and the redirect destinations below,
// which are the only two places in this file that need it. In src/ this value is
// import.meta.env.BASE_URL, reached through withBase() in src/lib/paths.ts - do
// not hardcode '/blog' there.
const BASE = '/blog';

// https://astro.build/config
export default defineConfig({
	// GitHub Pages *project* site, deployed from github.com/sambroughton/blog.
	// The site is served at https://sambroughton.github.io/blog, so `base` must
	// match the repository name. Every internal link and asset path must carry
	// that prefix, otherwise it works in dev and 404s in production.
	// Use `import.meta.env.BASE_URL` rather than hardcoding '/blog'.
	// Docs: https://docs.astro.build/en/guides/deploy/github/
	site: 'https://sambroughton.github.io',
	base: BASE,

	// Explicit rather than relying on the default, so the deployment target is
	// obvious: prerendered HTML uploaded to GitHub Pages, no server adapter.
	output: 'static',

	// The taxonomy refactor made categories the primary vocabulary and removed
	// domains from the site entirely. Technologies became categories under a new
	// prefix, so their archives moved; domain archives have no successor.
	//
	// Every entry under /posts/ is untouched, as is every /topics/<slug> - the
	// slugs those routes are keyed by are now derived from the display label by
	// slugify(), which reproduces the hand-written ids they used before.
	//
	// Enumerated rather than written as the dynamic pattern
	// '/technologies/[technology]', which the docs do allow. That form is
	// documented for redirects, but how a static build with no adapter decides
	// which concrete paths to emit files for is not, and there are only three
	// technology archives and three domain archives that were ever published -
	// each keyed by a value with at least one non-draft entry behind it. Explicit
	// keys make the emitted set the reviewable thing.
	// https://docs.astro.build/en/guides/routing/#redirects
	//
	// With no adapter these build to HTML files carrying a meta refresh, so the
	// redirect is the markup rather than a response and there is no point stating a
	// status: Astro's default 301 would never reach the client.
	//
	// The keys are base-relative and the values are NOT: Astro resolves the route
	// to match against `base` but emits the destination into the meta refresh, the
	// canonical and the fallback link verbatim. Without the prefix these pages
	// build clean, pass every check, and then send production traffic to
	// sambroughton.github.io/categories/... with no /blog in it - which 404s. The
	// docs do not cover the interaction, so this is from the build output.
	//
	// The slug is now identical on both sides, so each of these is the old path
	// with /technologies swapped for /categories. That is a coincidence worth
	// naming rather than a rule to lean on: category slugs are derived from the
	// display label by slugify(), and the labels carry the full product name -
	// "Microsoft Entra ID" - which happens to be exactly what the hand-written
	// technology ids were. The labels briefly dropped the "Microsoft " prefix,
	// which moved these archives to /categories/entra-id and left the three
	// destinations below pointing at pages that did not exist; restoring the
	// prefix restored them. Re-derive rather than assume if the labels move again.
	//
	// Verify after changing: dist/technologies/microsoft-entra-id/index.html should
	// refresh to /blog/categories/microsoft-entra-id - with the /blog, and against
	// a path that appears in the build's "generating static routes" list.
	redirects: {
		// The bare path went to the categories index, which no longer exists: the
		// header menu lists every category on every page, so the index was a second
		// copy of that list. Home is where a reader following this wanted to end up.
		'/technologies': `${BASE}/`,
		'/technologies/microsoft-sentinel': `${BASE}/categories/microsoft-sentinel`,
		'/technologies/microsoft-entra-id': `${BASE}/categories/microsoft-entra-id`,
		'/technologies/microsoft-defender-for-endpoint': `${BASE}/categories/microsoft-defender-for-endpoint`,

		// Domains have no equivalent to land on: they were disciplines cutting
		// across the products, and the nearest thing to any one of them is the
		// ledger itself. Home rather than /categories, because a reader arriving on
		// an old domain link wanted a listing of entries, which is what home is.
		'/domains/identity-security': `${BASE}/`,
		'/domains/endpoint-security': `${BASE}/`,
		'/domains/siem-detection-engineering': `${BASE}/`,
	},

	integrations: [
		// astroExpressiveCode must be registered BEFORE mdx() so that it can
		// process code blocks before MDX compiles them. This is the order
		// Starlight applies internally:
		// https://github.com/withastro/starlight/blob/main/packages/starlight/index.ts
		astroExpressiveCode({
			// Docs: https://expressive-code.com/reference/configuration/
			// One theme only: the site is dark-only, so there is no second theme to
			// switch to and no need for themeCssSelector or the dark-mode media query.
			themes: ['github-dark'],
			useDarkModeMediaQuery: false,
			styleOverrides: {
				// Square, matching the rest of the site's borders.
				borderRadius: '0',
				borderColor: '#1a2740',
				codeBackground: '#0a1220',
				codeFontFamily: "'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
				codeFontSize: '0.8rem',
				codeLineHeight: '1.65',
			},
			defaultProps: {
				wrap: true,
				overridesByLang: {
					// Shell commands read better unwrapped.
					'bash,sh,powershell': { wrap: false },
				},
			},
		}),
		mdx(),
		sitemap(),
	],

	vite: {
		// Tailwind CSS v4 ships as a Vite plugin rather than an Astro integration.
		// Docs: https://docs.astro.build/en/guides/styling/
		plugins: [tailwindcss()],
	},
});
