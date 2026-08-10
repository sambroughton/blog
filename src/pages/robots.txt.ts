import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/paths';

// CAVEAT: while this site is served from a project-repo subpath, this file lands
// at /blog/robots.txt, and crawlers only read robots.txt at the host root.
// Google's spec is explicit: "Crawlers don't check for robots.txt files in
// subdirectories." So this is inert for now - submit the sitemap directly in
// Search Console instead. It becomes live once the custom domain is in place
// and the site owns its root.
// Spec: https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
//
// The sitemap URL is derived from `site` + `base` so it cannot drift.
// Docs: https://docs.astro.build/en/guides/integrations-guide/sitemap/
export const GET: APIRoute = ({ site }) => {
	const body = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl('/sitemap-index.xml', site)}
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
