import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_LABELS, TOPIC_LABELS } from './consts';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: ({ image }) =>
		z.object({
			title: z.string().min(1).max(120),
			description: z.string().min(1).max(300),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),

			/**
			 * Microsoft security categories involved. At least one, from CATEGORIES in
			 * consts.ts, written as the display label rather than a slug.
			 *
			 * Order matters: the first is the primary category and the only one a
			 * ledger row shows, so lead with the one the entry is actually about.
			 */
			categories: z.array(z.enum(CATEGORY_LABELS)).nonempty(),

			/** Specific subjects covered. At least one, from TOPICS in consts.ts. */
			topics: z.array(z.enum(TOPIC_LABELS)).nonempty(),

			/** Optional grouping for multi-part write-ups. */
			series: z.string().optional(),
			featured: z.boolean().default(false),
			draft: z.boolean().default(false),
			cover: image().optional(),
			coverAlt: z.string().optional(),
		}),
});

export const collections = { blog };
