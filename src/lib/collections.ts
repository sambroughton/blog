import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE, CATEGORIES, TOPICS, type CategoryLabel, type TopicLabel } from '../consts';
import { slugify } from './slug';

export type Post = CollectionEntry<'blog'>;

/**
 * Every publishable entry, newest first.
 *
 * Draft filtering lives here rather than in each page so a new route cannot
 * accidentally leak drafts to production. Drafts stay visible in `astro dev`.
 */
export async function getPublishedPosts(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) =>
		import.meta.env.PROD ? !data.draft : true,
	);
	return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/**
 * Entries for the hero carousel: explicitly featured, newest first. Falls back
 * to the most recent entries so the hero is never empty on a young blog.
 */
export function selectHeroPosts(posts: Post[], limit = SITE.heroCount): Post[] {
	const featured = posts.filter((p) => p.data.featured);
	return (featured.length > 0 ? featured : posts).slice(0, limit);
}

/**
 * The category a ledger row shows. An entry lists every category it touches, but
 * a list row has space for one, and the schema documents the first as primary.
 *
 * Total, not optional: `categories` is a nonempty() array in the schema, so there
 * is always a first element and callers need no fallback.
 */
export function primaryCategory(post: Post): CategoryLabel {
	return post.data.categories[0];
}

/**
 * The topic a row shows when the category is the one thing every row on the page
 * has in common. Same rule as primaryCategory - first in the list, and total,
 * because `topics` is nonempty() in the schema too - so an entry's frontmatter
 * decides which of its subjects leads, in both vocabularies.
 */
export function primaryTopic(post: Post): TopicLabel {
	return post.data.topics[0];
}

/**
 * A taxonomy value that something has been published under.
 *
 * Keyed by `slug` rather than by the label, because the slug is what the routes
 * are built from and what links are compared against - carrying both means no
 * caller has to slugify a label a second time and get it subtly different.
 */
export type Facet = { slug: string; label: string; count: number };

/**
 * `pick` returns a list so the same counter serves both vocabularies, each of
 * which is multi-valued.
 *
 * Walks the catalogue and looks each count up, rather than the reverse, so the
 * deliberate CATEGORIES/TOPICS order carries through to every list. Catalogue
 * order is preserved on purpose: sorting by volume here would let the article
 * count dictate the narrative. Empty facets are dropped so a young blog does not
 * advertise sections with nothing behind them, and so no index can link to a
 * listing that generates no page.
 */
function countBy<T extends string>(
	posts: Post[],
	pick: (post: Post) => readonly T[],
	catalogue: readonly { label: T }[],
): Facet[] {
	const counts = new Map<T, number>();
	for (const post of posts) {
		for (const label of pick(post)) {
			counts.set(label, (counts.get(label) ?? 0) + 1);
		}
	}

	return catalogue
		.map(({ label }) => ({ slug: slugify(label), label, count: counts.get(label) ?? 0 }))
		.filter((facet) => facet.count > 0);
}

/**
 * Published categories, in catalogue order.
 *
 * This is the single source for the header menu and the getStaticPaths behind
 * every category archive, so the two can never disagree about which categories
 * exist or what a count is.
 *
 * A thin wrapper over countBy rather than a re-implementation of it: this used
 * to walk CATEGORIES a second time to join each entry's glyph and product colour
 * onto its facet, and with those fields gone there is nothing left to join.
 * Kept as a named function because it is what the callers import and because it
 * is where the categories-specific accessor lives.
 */
export function categoryFacets(posts: Post[]): Facet[] {
	return countBy(posts, (p) => p.data.categories, CATEGORIES);
}

/** Published topics, in catalogue order. Feeds the /topics index and archives. */
export function topicFacets(posts: Post[]): Facet[] {
	return countBy(posts, (p) => p.data.topics, TOPICS);
}

/**
 * Entries under one category, newest first because `posts` already is.
 *
 * Takes the slug rather than the label so the archive route can filter with the
 * same value it was routed by, without slugifying in two places.
 */
export function postsByCategory(posts: Post[], slug: string): Post[] {
	return posts.filter((post) => post.data.categories.some((label) => slugify(label) === slug));
}

/** Entries under one topic, newest first. Slug-keyed, as postsByCategory is. */
export function postsByTopic(posts: Post[], slug: string): Post[] {
	return posts.filter((post) => post.data.topics.some((label) => slugify(label) === slug));
}

/** Years that actually have entries, newest first. */
export function archiveYears(posts: Post[]): { year: number; count: number }[] {
	const counts = new Map<number, number>();
	for (const post of posts) {
		const year = post.data.pubDate.getUTCFullYear();
		counts.set(year, (counts.get(year) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([year, count]) => ({ year, count }))
		.sort((a, b) => b.year - a.year);
}

/** The sidebar is noise on a near-empty blog, so it only appears past a threshold. */
export function shouldShowSidebar(totalEntries: number): boolean {
	return totalEntries >= SITE.sidebarMinEntries;
}

/** Dates are stored and rendered in UTC so builds are timezone-independent. */
export function formatDate(date: Date): string {
	return date.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC',
	});
}

export function formatDayMonth(date: Date): string {
	return date.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		timeZone: 'UTC',
	});
}

export function isoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export type { CategoryLabel, TopicLabel };
