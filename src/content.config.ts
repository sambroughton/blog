import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { TOPIC_IDS } from './consts';

// Content collections config.
// Docs: https://docs.astro.build/en/guides/content-collections/
//
// Frontmatter is validated at build time, so a typo in a required field or an
// unrecognised topic fails the build rather than silently rendering wrong.

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: ({ image }) =>
		z.object({
			title: z.string().min(1).max(120),
			description: z.string().min(1).max(300),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),

			/** Subject area. Exactly one, drawn from the closed list in consts.ts. */
			topic: z.enum(TOPIC_IDS),

			/** Optional free-form keywords. Not used for navigation, only metadata. */
			tags: z.array(z.string()).default([]),

			/** Optional grouping for multi-part write-ups. */
			series: z.string().optional(),

			/**
			 * Surface this entry in the front-page hero carousel. At most
			 * SITE.heroCount are shown, newest first.
			 */
			featured: z.boolean().default(false),

			/**
			 * Drafts are excluded from production builds but visible in `astro dev`.
			 * Filtering lives in src/lib/collections.ts, not in each page.
			 */
			draft: z.boolean().default(false),

			/**
			 * Optional cover image, processed by Astro's image pipeline.
			 * Docs: https://docs.astro.build/en/guides/images/
			 */
			cover: image().optional(),
			coverAlt: z.string().optional(),
		}),
});

export const collections = { blog };
