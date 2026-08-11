import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { DOMAIN_IDS, TECHNOLOGY_IDS, TOPIC_IDS } from './consts';

// Content collections config.
// Docs: https://docs.astro.build/en/guides/content-collections/
//
// Frontmatter is validated at build time, so a typo in a required field or an
// unrecognised domain, topic or technology fails the build rather than silently
// rendering wrong.

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: ({ image }) =>
		z.object({
			title: z.string().min(1).max(120),
			description: z.string().min(1).max(300),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),

			/** The discipline this belongs to. Exactly one, from DOMAINS in consts.ts. */
			domain: z.enum(DOMAIN_IDS),

			/** Specific subjects covered. At least one, from TOPICS in consts.ts. */
			topics: z.array(z.enum(TOPIC_IDS)).nonempty(),

			/** Products involved. At least one, from TECHNOLOGIES in consts.ts. */
			technologies: z.array(z.enum(TECHNOLOGY_IDS)).nonempty(),

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
