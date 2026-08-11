import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '../consts';
import { getPublishedPosts } from '../lib/collections';
import { withBase } from '../lib/paths';

// Docs: https://docs.astro.build/en/recipes/rss/
export const GET: APIRoute = async (context) => {
	if (!context.site) {
		throw new Error('`site` must be set in astro.config.mjs to generate the RSS feed');
	}

	const posts = await getPublishedPosts();

	return rss({
		title: SITE.name,
		description: SITE.description,
		// Must include the base. `site` becomes the feed's channel <link>, i.e. the
		// "visit website" target in readers, and context.site alone would point at
		// the domain root rather than at this blog. Item links are unaffected:
		// they are root-absolute, so they resolve from the origin either way.
		site: new URL(withBase('/'), context.site),
		// `link` is resolved against `site`, so it must carry the base prefix.
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: withBase(`/posts/${post.id}`),
			categories: [post.data.domain, ...post.data.topics],
		})),
		customData: '<language>en-gb</language>',
	});
};
