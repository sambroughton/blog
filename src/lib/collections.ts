import { getCollection, type CollectionEntry } from 'astro:content';
import {
	LABS_TOPIC,
	SITE,
	SOLUTIONS,
	TOPICS,
	type SolutionLabel,
	type TopicLabel,
} from '../consts';
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
 * The solution a ledger row leads with. An entry lists every product it touches,
 * but the label above a row's title has space for one, and the schema documents
 * the first as primary.
 *
 * Total, not optional: `solutions` is a nonempty() array in the schema, so there
 * is always a first element and callers need no fallback.
 */
export function primarySolution(post: Post): SolutionLabel {
	return post.data.solutions[0];
}

/**
 * The topic-side mirror of primarySolution - first in the list, and total for the
 * same reason, because `topics` is nonempty() in the schema too.
 *
 * This is the tag a row shows on a solution archive, where the product is already
 * the h1 above it. See rowTag() below.
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
 *
 * Parameterised on the label so a facet stays tied to the vocabulary it came out
 * of: solutionFacets() hands back a SolutionLabel, which is what <SolutionTag>
 * takes, so a caller can pass one straight through instead of asserting its way
 * past a widened `string`. Defaults to `string` for callers that only need the
 * shape - topFacets() below is the one that does.
 */
export type Facet<Label extends string = string> = { slug: string; label: Label; count: number };

/**
 * `pick` returns a list so the same counter serves both vocabularies, each of
 * which is multi-valued.
 *
 * Walks the catalogue and looks each count up, rather than the reverse, so the
 * deliberate SOLUTIONS/TOPICS order carries through to every list. Catalogue
 * order is preserved on purpose: sorting by volume here would let the article
 * count dictate the narrative. Empty facets are dropped so a young blog does not
 * advertise sections with nothing behind them, and so no index can link to a
 * listing that generates no page.
 */
function countBy<T extends string>(
	posts: Post[],
	pick: (post: Post) => readonly T[],
	catalogue: readonly { label: T }[],
): Facet<T>[] {
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
 * Published solutions, in catalogue order.
 *
 * This is the single source for the header menu, the /solutions index, the search
 * page's Solution filter and the getStaticPaths behind every solution archive, so
 * none of the four can disagree about which products exist or what a count is.
 *
 * A thin wrapper over countBy rather than a re-implementation of it: this used
 * to walk the catalogue a second time to join each entry's glyph and product
 * colour onto its facet, and with those fields gone there is nothing left to
 * join. Kept as a named function because it is what the callers import and
 * because it is where the solution-specific accessor lives.
 */
export function solutionFacets(posts: Post[]): Facet<SolutionLabel>[] {
	return countBy(posts, (p) => p.data.solutions, SOLUTIONS);
}

/**
 * Published topics, in catalogue order.
 *
 * One caller left, the search page's Topic filter, and that is the only place a
 * topic is still something a reader can act on - as a select option matched
 * against a row's data attribute, not as a link. The /topics index and the
 * per-topic archives this also fed are gone; see the note on TOPICS in consts.ts.
 */
export function topicFacets(posts: Post[]): Facet<TopicLabel>[] {
	return countBy(posts, (p) => p.data.topics, TOPICS);
}

/**
 * The `limit` most-published facets, heaviest first.
 *
 * The one place volume would be allowed to set the order, against the catalogue
 * order every other list keeps - and nothing calls it today. It ranked the rail's
 * "Popular Tags" block, which merged both vocabularies and took the busiest eight.
 * That block is gone, and so is the complete run of solution tags that replaced
 * it: the rail carries no facet list at all now. Every list that remains - the
 * header menu, the /solutions index, the search filters - is a complete set shown
 * in catalogue order, because a portfolio's product list is a fixed thing to be
 * shown whole rather than a shortlist to be ranked. Kept for the next list that
 * genuinely is a shortlist, with the reasoning that made it right for one intact.
 *
 * Copies before sorting: countBy() builds a fresh array per call today, but a
 * helper that reorders its argument in place is a trap for whatever caches one
 * later. Ties hold catalogue order, because Array.prototype.sort is required to
 * be stable (ES2019 onwards) and countBy() emits in catalogue order - which is
 * what keeps a build reproducible when several facets share a count.
 * https://tc39.es/ecma262/#sec-array.prototype.sort
 *
 * Generic on the facet rather than taking Facet[] outright, so the label type
 * survives the shortlisting: a caller passing the result to <SolutionTag> needs a
 * SolutionLabel and not the `string` a widened return would give it.
 */
export function topFacets<F extends Facet>(facets: F[], limit: number): F[] {
	return [...facets].sort((a, b) => b.count - a.count).slice(0, limit);
}

/**
 * The one tag a ledger row carries, and which vocabulary it came out of.
 *
 * A discriminated union rather than a bare label, because the two render
 * differently and are not interchangeable: a solution tag is a link to that
 * product's archive, a topic tag is plain text. EntryMeta.astro is what draws
 * them; this type is what stops it having to guess.
 */
export type RowTag =
	{ kind: 'solution'; label: SolutionLabel } | { kind: 'topic'; label: TopicLabel };

/**
 * The tag a single ledger row shows, given whether its page is already one
 * solution.
 *
 * One rule: show the product, unless the page has already said it. On a solution
 * archive every row would repeat the h1, so those rows show their primary topic
 * instead - the thing that actually separates one row from the next there.
 *
 * This replaces rowTaxonomy(), which returned a caps eyebrow above the title plus
 * a capped middot line of areas and topics beneath it. Both are gone: the eyebrow
 * because a row leading with a product name in caps made the product louder than
 * the title, and the meta line because with the group layer removed it was topics
 * alone, unlinked, at three-per-row - a caption listing tags that go nowhere. One
 * tag and the reading time is what the row carried before all of that, and it is
 * what it carries again. The full topic list is on the entry page.
 */
export function rowTag(post: Post, filteredBySolution = false): RowTag {
	return filteredBySolution
		? { kind: 'topic', label: primaryTopic(post) }
		: { kind: 'solution', label: primarySolution(post) };
}

/**
 * Filter keys for one row, as `data-*` attributes, for the search page to match
 * against without a JSON index or a second copy of the row markup.
 *
 * Slugs rather than labels on the two taxonomy attributes, so a `<option
 * value>` built from a Facet's `slug` compares directly and nothing has to
 * slugify at match time. Space-separated because slugify() collapses every run of
 * non-alphanumerics to a hyphen, so a slug can never contain a space - which makes
 * `split(' ').includes(value)` an exact whole-value match rather than a substring
 * one. That matters: 'detection-engineering' and 'detection-tuning' would both
 * match a naive `includes()` on the joined string.
 *
 * `data-text` is the haystack for the text box, lowercased at build so the script
 * does not redo it per keystroke. It duplicates the description into an attribute,
 * which is why this is opt-in per listing rather than something every row carries.
 */
export function rowFilterData(post: Post): Record<string, string> {
	return {
		'data-solutions': post.data.solutions.map(slugify).join(' '),
		'data-topics': post.data.topics.map(slugify).join(' '),
		'data-text': `${post.data.title} ${post.data.description}`.toLowerCase(),
	};
}

/**
 * Entries under one solution, newest first because `posts` already is.
 *
 * Takes the slug rather than the label so the archive route can filter with the
 * same value it was routed by, without slugifying in two places.
 */
export function postsBySolution(posts: Post[], slug: string): Post[] {
	return posts.filter((post) => post.data.solutions.some((label) => slugify(label) === slug));
}

/**
 * Entries under one topic, newest first. Slug-keyed, as postsBySolution is.
 *
 * No route calls this any more - there are no per-topic archives - but postsInLabs
 * below is one topic filtered by label, which is the same question asked of the
 * one topic that does have a page.
 */
export function postsByTopic(posts: Post[], slug: string): Post[] {
	return posts.filter((post) => post.data.topics.some((label) => slugify(label) === slug));
}

/**
 * Entries carrying the Labs topic, newest first because `posts` already is.
 *
 * Matched on the label rather than on a slug, unlike every other filter here, and
 * that is the honest form for this one: /labs is a fixed route rather than a
 * generated one, so there is no slug it was routed by to compare against. LABS_TOPIC
 * is checked against TopicLabel in consts.ts, so the string cannot drift from the
 * catalogue without failing the build.
 *
 * May be empty, and the page has to say so rather than 404: /labs exists whether or
 * not anything carries the tag yet.
 */
export function postsInLabs(posts: Post[]): Post[] {
	return posts.filter((post) => post.data.topics.includes(LABS_TOPIC));
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

export type { SolutionLabel, TopicLabel };
