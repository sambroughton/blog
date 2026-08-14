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

	// The product archives have moved twice, so there are two generations of dead
	// path here.
	//
	// First: a taxonomy refactor made "categories" the primary vocabulary and
	// removed domains from the site entirely. Technologies became categories under
	// a new prefix, so their archives moved; domain archives have no successor.
	//
	// Then: that vocabulary was renamed to "solutions", because the blog reads as a
	// portfolio and the product an entry is built on is the strongest signal in it -
	// see the note at the top of src/consts.ts. Same values, same slugs, new prefix,
	// so /categories/<slug> became /solutions/<slug>.
	//
	// The /technologies keys point straight at /solutions and do NOT chain through
	// /categories. With no adapter each of these is an HTML file carrying a meta
	// refresh rather than a server response, so a chain is two document loads and
	// two visible flashes for a reader, not a free 301 hop. Astro emits the value
	// verbatim and never resolves it against the rest of this map, so pointing at
	// the final destination is a plain edit rather than a trick.
	//
	// Every entry under /posts/ is untouched by both moves.
	//
	// /topics is a third dead prefix and is deliberately NOT keyed here yet. The
	// topics index, the per-topic archives and the five group archives under it have
	// all been removed - topics are tags rather than destinations now; see the note
	// on TOPICS in src/consts.ts - so every /topics URL 404s as of this change.
	//
	// Left out rather than forgotten, because the rule this map is built on is
	// "checked against the previous build rather than reasoned about", and that check
	// has not been done: it needs the deployed sitemap, not this repo. If those URLs
	// were live, the honest set is /topics, /topics/<slug> for each published topic
	// and each of the five groups, and the destination for all of them is arguable -
	// there is no successor page, so it is either / or /search, the latter being the
	// only place a topic is still something a reader can act on.
	//
	// Enumerated rather than written as the dynamic pattern
	// '/technologies/[technology]', which the docs do allow. That form is
	// documented for redirects, but how a static build with no adapter decides
	// which concrete paths to emit files for is not. Explicit keys make the emitted
	// set the reviewable thing.
	// https://docs.astro.build/en/guides/routing/#redirects
	//
	// Which paths get a key is decided by what was ever actually served, not by what
	// the catalogue could have produced. Three technology archives, three domain
	// archives, and three category archives - each keyed by a value that had at
	// least one non-draft entry behind it. The other four products in SOLUTIONS have
	// only drafts, so /categories/microsoft-defender-for-identity, -for-office-365,
	// -for-cloud-apps and -for-cloud never returned 200 to anyone and are
	// deliberately absent: a redirect preserves a URL that was live, and inventing
	// one for a URL that never resolved would assert a history that did not happen.
	// Checked against the previous build rather than reasoned about - dist/categories
	// held exactly those three directories and dist/sitemap-0.xml listed exactly
	// those three URLs.
	//
	// There is no bare '/categories' key for the same reason: that index page was
	// removed before any deploy, so dist/categories never had an index.html. Contrast
	// '/technologies', which did generate and therefore does get one.
	//
	// With no adapter these build to HTML files carrying a meta refresh, so the
	// redirect is the markup rather than a response and there is no point stating a
	// status: Astro's default 301 would never reach the client.
	//
	// The keys are base-relative and the values are NOT: Astro resolves the route
	// to match against `base` but emits the destination into the meta refresh, the
	// canonical and the fallback link verbatim. Without the prefix these pages
	// build clean, pass every check, and then send production traffic to
	// sambroughton.github.io/solutions/... with no /blog in it - which 404s. The
	// docs do not cover the interaction, so this is from the build output.
	//
	// The slug is identical on both sides of every hop, so each of these is the old
	// path with its prefix swapped. That is a coincidence worth naming rather than a
	// rule to lean on: solution slugs are derived from the display label by
	// slugify(), and the labels carry the full product name - "Microsoft Entra ID" -
	// which happens to be exactly what the hand-written technology ids were. The
	// labels briefly dropped the "Microsoft " prefix, which moved these archives to
	// /entra-id and left the destinations below pointing at pages that did not exist;
	// restoring the prefix restored them. Re-derive rather than assume if the labels
	// move again.
	//
	// Verify after changing: dist/technologies/microsoft-entra-id/index.html and
	// dist/categories/microsoft-entra-id/index.html should both refresh to
	// /blog/solutions/microsoft-entra-id - with the /blog, in one hop, and against a
	// path that appears in the build's "generating static routes" list.
	redirects: {
		// The bare path went to a products index, which does not exist and did not
		// then either: the header menu listed every product on every page, so an index
		// would have been a second copy of that list. (The menu has since become the
		// five areas and lists no products at all - the rail carries them now - so
		// that reasoning is history rather than a description of today.) Home is where
		// a reader following this wanted to end up.
		'/technologies': `${BASE}/`,
		'/technologies/microsoft-sentinel': `${BASE}/solutions/microsoft-sentinel`,
		'/technologies/microsoft-entra-id': `${BASE}/solutions/microsoft-entra-id`,
		'/technologies/microsoft-defender-for-endpoint': `${BASE}/solutions/microsoft-defender-for-endpoint`,

		// The three category archives that were ever published. Same values behind
		// them, so these are true redirects rather than approximations.
		'/categories/microsoft-sentinel': `${BASE}/solutions/microsoft-sentinel`,
		'/categories/microsoft-entra-id': `${BASE}/solutions/microsoft-entra-id`,
		'/categories/microsoft-defender-for-endpoint': `${BASE}/solutions/microsoft-defender-for-endpoint`,

		// Domains have no equivalent to land on: they were disciplines cutting
		// across the products, and the nearest thing to any one of them is the
		// ledger itself. Home rather than a product archive, because a reader arriving
		// on an old domain link wanted a listing of entries, which is what home is.
		//
		// The five topic areas are arguably closer now, since they are disciplines
		// too - but the mapping is not clean (siem-detection-engineering spans two of
		// them) and these paths have been dead through two refactors, so home stays.
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
				// A code block is the one scroll container on the site this stylesheet
				// cannot reach: Expressive Code ships its own ::-webkit-scrollbar rules
				// for `pre`, and in Chromium and Safari those beat the scrollbar-color
				// set on :root in global.css. Left alone, the thumb is whichever grey
				// github-dark names for scrollbarSlider.background, so a code block gets
				// the syntax theme's scrollbar while everything beside it gets the
				// site's - and only in those browsers, since Firefox ignores the webkit
				// rules and inherits from :root either way.
				//
				// These two values close both gaps. They are --color-text-3 and
				// --color-text-2 written out, exactly as borderColor and codeBackground
				// above are --color-rule and --color-surface written out: this file
				// cannot see the @theme block, so the duplication is the interface
				// between them and all four move together or not at all.
				// https://expressive-code.com/reference/style-overrides/
				scrollbarThumbColor: '#6b7fa0',
				scrollbarThumbHoverColor: '#93a4c0',
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
