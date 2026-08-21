// @ts-check
import { defineConfig } from 'astro/config';

import astroExpressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The one place this path is written in this file. It fed the redirect
// destinations as well until those were removed, so `base` is now its only
// consumer; kept as a const because this is the value to change if the repo is
// ever renamed. In src/ the same value is import.meta.env.BASE_URL, reached
// through withBase() in src/lib/paths.ts - do not hardcode '/blog' there.
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
