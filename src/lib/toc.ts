import type { MarkdownHeading } from 'astro';

/**
 * One numbered entry in the contents list, with its subsections under it.
 *
 * Two levels and no more. An article's `##` headings are its sections and are
 * what a reader is navigating by; `###` are subsections and are carried so a
 * long section is not a single opaque row. `####` and below are dropped - a
 * contents list deep enough to need four levels is describing a document that
 * wants splitting, and rendering it would put a wall of links in a 16rem rail.
 */
export interface TocSection {
	slug: string;
	text: string;
	children: { slug: string; text: string }[];
}

/**
 * Build the contents list from the headings Astro's render() hands back.
 *
 * The slugs are not derived here. Astro's markdown pipeline generates an `id` on
 * every heading and reports the same value as `slug`, so the anchors in this list
 * and the ids in the rendered body come from one source and cannot drift. That is
 * the whole reason this takes MarkdownHeading rather than parsing the body.
 * https://docs.astro.build/en/guides/markdown-content/#heading-ids
 *
 * A `###` before any `##` has no section to belong to and is dropped rather than
 * promoted. Promoting it would put a subsection in the numbered list as though it
 * were a section, which misreports the document; dropping it loses a link. Neither
 * is good and the quiet one is better, because the heading is still in the body
 * with an id on it and still reachable by scrolling.
 *
 * Returns an empty array for an article with no headings, which the caller has to
 * handle: several entries here are short enough to have none, and a "Table of
 * contents" heading over nothing is worse than no rail at all.
 */
export function buildToc(headings: MarkdownHeading[]): TocSection[] {
	const sections: TocSection[] = [];

	for (const heading of headings) {
		if (heading.depth === 2) {
			sections.push({ slug: heading.slug, text: heading.text, children: [] });
		} else if (heading.depth === 3 && sections.length > 0) {
			sections[sections.length - 1].children.push({ slug: heading.slug, text: heading.text });
		}
	}

	return sections;
}
