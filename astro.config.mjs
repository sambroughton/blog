// @ts-check
import { defineConfig } from 'astro/config';

import astroExpressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	// GitHub Pages *project* site, deployed from github.com/sambroughton/blog.
	// The site is served at https://sambroughton.github.io/blog, so `base` must
	// match the repository name. Every internal link and asset path must carry
	// that prefix, otherwise it works in dev and 404s in production.
	// Use `import.meta.env.BASE_URL` rather than hardcoding '/blog'.
	// Docs: https://docs.astro.build/en/guides/deploy/github/
	site: 'https://sambroughton.github.io',
	base: '/blog',

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
