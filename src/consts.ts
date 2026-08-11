// Single source of truth for site identity and taxonomy.
//
// Two vocabularies, each answering a different question about an entry, and each
// compiled into the content-collection schema so a typo fails the build rather
// than silently creating a one-off value:
//
//   Category   which Microsoft security product the work sits in   one or more
//   Topic      what specific subject it covers                     one or more
//
// Categories are the primary classification and Topics the secondary one: the
// blog's job is to show which Microsoft security solutions are being built on
// and which XDR engineering subjects have been covered inside them. The
// vocabulary is named "Category" rather than "Solution" because that is what the
// site calls it to a reader; the values in it are still Microsoft products.
//
// Entries carry the display label verbatim, not a slug. URLs are derived from
// the label by slugify() in lib/slug.ts, so a label reword is a URL change -
// which is the honest trade for frontmatter that reads as prose.
//
// Adding a value means adding it here and nowhere else. The indexes, the counts,
// the header menu and every archive route are built from the entries that
// actually use a value, so a catalogue entry nothing references stays invisible.

export const SITE = {
	name: "Sam's Blog",
	tagline: 'Powered by learning. Engineered for defence.',
	/** Short form of the tagline, for the browser tab where space is tight. */
	shortTagline: 'Powered By Learning',
	description:
		'Field reports, detection queries and deployment notes on Microsoft security engineering: Entra ID, Defender XDR, Sentinel and Azure.',
	author: 'Sam Broughton',
	/**
	 * Entries per page in the ledger, as the mockup implied. Each row carries a
	 * date, title, description and meta line, and the hero sits above the list on
	 * every page including the paginated ones, so a longer list would make for a
	 * tall page. The trade is more pagination hops, which is the cheaper cost.
	 */
	pageSize: 6,
	/** Below this many published entries the sidebar is noise, so it is hidden. */
	sidebarMinEntries: 3,
	/** How many entries the hero carousel shows at most. */
	heroCount: 3,
} as const;

/**
 * Category: the Microsoft security product or service an entry is about. One or
 * more per entry, the first being the primary one - that is the only one the
 * ledger rows show, so order inside an entry's `categories` list is meaningful.
 *
 * The order here is the platform pair first, then the Defender family in scope
 * order: device, identity, collaboration, SaaS, cloud estate. Facet lists render
 * in this order rather than by volume, so the article count does not dictate the
 * narrative. Categories with nothing published are filtered out at render time
 * rather than removed from this list, so one can be written towards before it
 * appears anywhere.
 *
 * `icon` names a glyph in Icon.astro. The literal types tie the two together:
 * CategoryIcon below is the union of exactly these strings and Icon's prop only
 * accepts keys of its own PATHS map, so naming a glyph that component does not
 * carry fails the build rather than rendering nothing.
 *
 * `color` is the glyph's colour, approximating the product's own mark so the
 * menu is scannable by shape and hue rather than by reading six labels that all
 * begin "Defender for". Deliberately NOT a --color-* token in global.css: these
 * are product marks, not part of the site's palette, and promoting them to
 * tokens would invite their use on site chrome. Every glyph is aria-hidden with
 * its label immediately beside it, so colour never carries meaning on its own
 * (WCAG 1.4.1).
 *
 * The "Microsoft " prefix is deliberately not carried here. Every value would
 * have it, so it distinguishes nothing and costs the width of the word in every
 * menu row, tag and breadcrumb - and the site's own description already says
 * these are Microsoft products. Note that the labels are the URLs: dropping it
 * makes the archive /categories/entra-id, not /categories/microsoft-entra-id.
 */
export const CATEGORIES = [
	{ label: 'Defender XDR', icon: 'dashboard', color: '#7a8cf0' },
	{ label: 'Sentinel', icon: 'shield', color: '#3aa0e0' },
	{ label: 'Entra ID', icon: 'diamond', color: '#4cc2ff' },
	{ label: 'Defender for Endpoint', icon: 'computer', color: '#8fa3c4' },
	{ label: 'Defender for Identity', icon: 'person', color: '#8fa3c4' },
	{ label: 'Defender for Office 365', icon: 'mail', color: '#e0553f' },
	{ label: 'Defender for Cloud Apps', icon: 'cloud', color: '#8fa3c4' },
	{ label: 'Defender for Cloud', icon: 'security', color: '#8fa3c4' },
] as const;

/**
 * Topic: the specific technical subject an entry covers. One or more per entry.
 *
 * Alphabetical, because there is nothing to group them by any more and a reader
 * scanning the index for a known subject is looking one up rather than browsing
 * a progression. These previously named a parent domain, which existed only to
 * group the topics index; domains are gone from the information architecture and
 * that field went with them.
 *
 * Near-synonyms are deliberate and distinct: Detection Engineering is building a
 * detection, Detection Tuning is fixing one that fires badly; Incident
 * Investigation is the incident-level work, Device Investigation the host-level
 * work beneath it.
 */
export const TOPICS = [
	{ label: 'Advanced Hunting' },
	{ label: 'Analytics Rules' },
	{ label: 'Attack Surface Reduction' },
	{ label: 'Authentication' },
	{ label: 'Conditional Access' },
	{ label: 'Data Collection' },
	{ label: 'Detection Engineering' },
	{ label: 'Detection Tuning' },
	{ label: 'Device Investigation' },
	{ label: 'Device Onboarding' },
	{ label: 'Endpoint Hardening' },
	{ label: 'External Access' },
	{ label: 'Guest Accounts' },
	{ label: 'Identity Investigation' },
	{ label: 'Identity Protection' },
	{ label: 'Incident Investigation' },
	{ label: 'KQL' },
	{ label: 'Privileged Access' },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategoryLabel = Category['label'];
export type TopicLabel = (typeof TOPICS)[number]['label'];

/** The glyphs the category lists need Icon.astro to carry. */
export type CategoryIcon = Category['icon'];

// z.enum() needs a non-empty tuple, hence the assertions.
export const CATEGORY_LABELS = CATEGORIES.map((s) => s.label) as [
	CategoryLabel,
	...CategoryLabel[],
];
export const TOPIC_LABELS = TOPICS.map((t) => t.label) as [TopicLabel, ...TopicLabel[]];

// Plain header links, rendered after the Categories menu. The disclaimer keeps the
// /about path so existing links resolve; only the label changed, since the page
// is no longer a biography.
export const NAV = [{ href: '/about', label: 'Disclaimer' }] as const;
