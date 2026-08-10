import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Content collections config.
// Docs: https://docs.astro.build/en/guides/content-collections/
//
// Frontmatter is validated at build time, so a typo in a required field fails
// the build rather than silently rendering an empty page.

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: ({ image }) =>
		z.object({
			title: z.string().min(1).max(120),
			description: z.string().min(1).max(300),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),

			// Free-form for now. To enforce a controlled vocabulary later, swap
			// z.string() for z.enum(['sentinel', 'defender-xdr', 'entra-id', ...]).
			tags: z.array(z.string()).default([]),

			// Optional grouping for multi-part write-ups.
			series: z.string().optional(),

			// Drafts must be filtered out explicitly in queries, e.g.
			// getCollection('blog', ({ data }) => import.meta.env.PROD ? !data.draft : true)
			draft: z.boolean().default(false),

			// Optional social/cover image, processed by Astro's image pipeline.
			// Docs: https://docs.astro.build/en/guides/images/
			cover: image().optional(),
			coverAlt: z.string().optional(),
		}),
});

export const collections = { blog };
