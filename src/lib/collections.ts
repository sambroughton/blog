import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE, TOPICS, type TopicId } from '../consts';

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

export type Facet<T extends string> = { id: T; label: string; count: number };

function countBy<T extends string>(
	posts: Post[],
	pick: (post: Post) => T,
	catalogue: readonly { id: T; label: string }[],
): Facet<T>[] {
	const counts = new Map<T, number>();
	for (const post of posts) {
		const key = pick(post);
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	// Catalogue order is preserved deliberately: TOPICS is ordered by the intended
	// progression across the discipline, and sorting by volume here would let the
	// article count dictate the narrative. Empty facets are dropped so a young
	// blog does not advertise sections with nothing behind them.
	return catalogue
		.map(({ id, label }) => ({ id, label, count: counts.get(id) ?? 0 }))
		.filter((facet) => facet.count > 0);
}

export function topicFacets(posts: Post[]): Facet<TopicId>[] {
	return countBy(posts, (p) => p.data.topic, TOPICS);
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
