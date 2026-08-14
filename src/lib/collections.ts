import { getCollection, type CollectionEntry } from 'astro:content';
import {
	SITE,
	SOLUTIONS,
	TOPICS,
	TOPIC_GROUPS,
	type SolutionLabel,
	type TopicGroup,
	type TopicGroupIconName,
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
 * Nothing calls this today. A ledger row used to show exactly one topic and this
 * was what picked it; rows now carry several, chosen by rowTaxonomy() below, and
 * the entry page shows the lot. Kept because it is the honest accessor for "the
 * subject this entry leads with", which is a question the frontmatter answers and
 * a caller may well ask again.
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
 * takes, so the rail can pass one straight through instead of asserting its way
 * past a widened `string`. Defaults to `string` for callers that only need the
 * shape - topFacets() and topicGroupFacets() below are the two that do.
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
 * This is the single source for the rail's Solutions block, the search page's
 * Solution filter and the getStaticPaths behind every solution archive, so none
 * of the three can disagree about which products exist or what a count is.
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

/** Published topics, in catalogue order. Feeds the /topics index and archives. */
export function topicFacets(posts: Post[]): Facet<TopicLabel>[] {
	return countBy(posts, (p) => p.data.topics, TOPICS);
}

/**
 * The `limit` most-published facets, heaviest first.
 *
 * The one place volume would be allowed to set the order, against the catalogue
 * order every other list keeps - and nothing calls it today. It ranked the rail's
 * "Popular Tags" block, which merged both vocabularies and took the busiest
 * eight; the rail now lists the published solutions in catalogue order instead,
 * because a portfolio's product list is a fixed set to be shown completely rather
 * than a shortlist to be ranked. Kept for the next list that genuinely is a
 * shortlist, with the reasoning that made it right for one intact.
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
 * True if an entry belongs to a group: it carries one of the group's topics, or
 * one of its solutions.
 *
 * OR rather than AND, which is what makes a group a door rather than a filter. A
 * group is defined against whichever vocabulary describes it - Cloud has only
 * solutions, Security Engineering only topics - so requiring both would empty
 * every group that leaves one side blank.
 *
 * The one line in this file that reads both renamed fields: `group.solutions` is
 * a hand-written membership list in consts.ts and `post.data.solutions` is
 * frontmatter. Two independent things that happen to share a word.
 */
function inGroup(post: Post, group: TopicGroup): boolean {
	return (
		group.topics.some((label) => post.data.topics.includes(label)) ||
		group.solutions.some((label) => post.data.solutions.includes(label))
	);
}

/**
 * The areas an entry lands in, in TOPIC_GROUPS order.
 *
 * "Area" rather than "group" because that is the word the site shows a reader -
 * topics/[topic].astro has printed it as the eyebrow on a group archive since
 * before this existed, and there is no reason for two names.
 *
 * May be empty. Nothing enforces that every topic is claimed by a group, as
 * TOPIC_GROUPS itself points out, so callers must handle an entry that lands
 * nowhere rather than assuming a first element the way primarySolution can.
 */
export function areasFor(post: Post): string[] {
	return TOPIC_GROUPS.filter((group) => inGroup(post, group)).map((group) => group.label);
}

/**
 * The taxonomy value a listing is already filtered by.
 *
 * Omitted on a mixed listing - the ledger, an archive year, the search page.
 * Passed by every archive that is one value of something, so rowTaxonomy() below
 * can drop what the heading has already said instead of repeating it down the
 * page. This replaces EntryList's old `tag: 'category' | 'topic'` prop, which
 * chose *which* vocabulary a row showed; the row now shows both, so the question
 * changed from "which one" to "which value is redundant here".
 *
 * A union rather than a label plus a kind, because 'solution' needs no label:
 * postsBySolution() guarantees every row on that page shares the page's product,
 * whereas an entry on an area or topic archive carries others besides the one it
 * was routed by.
 *
 * 'area' and 'topic' are structurally identical and kept separate anyway: they
 * mirror the `kind` topics/[topic].astro already routes by, so the call site reads
 * as the page describing itself rather than as a lookup into this file. The label
 * is `string` on both rather than TopicLabel on one, because that route
 * destructures Astro.props - which collapses its own discriminated union and hands
 * over a widened label. Narrowing it back would mean asserting at the call site to
 * satisfy a type that buys nothing here: the value is only ever compared for
 * equality against labels that came out of the same catalogue.
 */
export type ListingFilter =
	{ kind: 'solution' } | { kind: 'area'; label: string } | { kind: 'topic'; label: string };

/** What a ledger row renders above and below its title. */
export interface RowTaxonomy {
	/** The caps label above the title. Absent on a solution archive. */
	eyebrow?: SolutionLabel;
	/** Meta-line values, coarsest first, capped at SITE.rowFacetCount. */
	facets: string[];
}

/**
 * The taxonomy a single ledger row shows, given what its page is already filtered
 * by.
 *
 * One rule, applied to both vocabularies: drop what the page has already said.
 * On a solution archive the eyebrow goes, because the product is the h1 and a
 * label repeating it down every row separates nothing - which leaves those rows
 * two lines rather than three, and that is correct. On an area or topic archive
 * the eyebrow stays and the routed value is filtered out of the meta line, so the
 * line keeps saying something new.
 *
 * Coarsest first - one area, then the topics - so a row reads product, subject
 * area, techniques, the same widening order the search filters read in.
 *
 * One area, not all of them: most entries land in two or three, and listing them
 * would spend the whole line on the layer with the least information in it.
 * TOPIC_GROUPS order picks which, so it is stable and reproducible rather than
 * dependent on frontmatter ordering. Worth knowing this is a pick and not a
 * claim - consts.ts is explicit that groups are doors into the archive rather
 * than a count of what an entry "really" is.
 */
export function rowTaxonomy(post: Post, filter?: ListingFilter): RowTaxonomy {
	const areas = areasFor(post).filter(
		(label) => !(filter?.kind === 'area' && label === filter.label),
	);
	const topics = post.data.topics.filter(
		(label) => !(filter?.kind === 'topic' && label === filter.label),
	);

	return {
		eyebrow: filter?.kind === 'solution' ? undefined : primarySolution(post),
		facets: [...areas.slice(0, 1), ...topics].slice(0, SITE.rowFacetCount),
	};
}

/**
 * Filter keys for one row, as `data-*` attributes, for the search page to match
 * against without a JSON index or a second copy of the row markup.
 *
 * Slugs rather than labels on the three taxonomy attributes, so a `<option
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
		'data-areas': areasFor(post).map(slugify).join(' '),
		'data-topics': post.data.topics.map(slugify).join(' '),
		'data-text': `${post.data.title} ${post.data.description}`.toLowerCase(),
	};
}

/**
 * Groups with something published, in TOPIC_GROUPS order, carrying the glyph the
 * header menu draws beside each label.
 *
 * Counted per entry rather than per tag, unlike countBy(): an entry can match a
 * group through several of its topics at once, and counting those would say six
 * where the reader will find four. Empty groups are dropped for the reason every
 * other facet list drops them - no menu row can lead to a listing that generates
 * no page.
 */
export function topicGroupFacets(posts: Post[]): (Facet & { icon: TopicGroupIconName })[] {
	return TOPIC_GROUPS.map((group) => ({
		slug: slugify(group.label),
		label: group.label,
		icon: group.icon,
		count: posts.filter((post) => inGroup(post, group)).length,
	})).filter((facet) => facet.count > 0);
}

/** Entries in one group, newest first. Slug-keyed, as the others are. */
export function postsByTopicGroup(posts: Post[], slug: string): Post[] {
	const group = TOPIC_GROUPS.find((candidate) => slugify(candidate.label) === slug);
	return group ? posts.filter((post) => inGroup(post, group)) : [];
}

/**
 * Fails the build if a group and a topic would slug to the same URL segment.
 *
 * Both live under /topics/<slug>, from one dynamic route, so a collision is not a
 * cosmetic problem: getStaticPaths would emit the same param twice and one of the
 * two pages would silently not exist. Nothing in the type system can catch it -
 * the collision is between two independent lists of display labels - and it is
 * one word away at all times, since adding a topic called "Cloud" or a group
 * called "KQL" is an entirely reasonable thing to want to do.
 *
 * Called from the route's getStaticPaths rather than at module load, so the error
 * arrives while Astro is generating the routes it is about.
 */
export function assertNoTopicSlugCollisions(): void {
	const groups = new Set(TOPIC_GROUPS.map((group) => slugify(group.label)));
	const clashes = TOPICS.map((topic) => slugify(topic.label)).filter((slug) => groups.has(slug));

	if (clashes.length > 0) {
		throw new Error(
			`TOPIC_GROUPS and TOPICS in consts.ts both slug to /topics/${clashes.join(', /topics/')}. ` +
				'Both are served by src/pages/topics/[topic].astro, so one of the two pages would not be ' +
				'generated. Rename whichever label is newer.',
		);
	}
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

/** Entries under one topic, newest first. Slug-keyed, as postsBySolution is. */
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

export type { SolutionLabel, TopicLabel };
