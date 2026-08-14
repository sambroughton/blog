// Single source of truth for site identity and taxonomy.
//
// Two vocabularies, each answering a different question about an entry, and each
// compiled into the content-collection schema so a typo fails the build rather
// than silently creating a one-off value:
//
//   Solution   which Microsoft security product the work sits in   one or more
//   Topic      what specific subject it covers                     one or more
//
// Solutions are the primary classification and Topics the secondary one: the
// blog's job is to show which Microsoft security products are being built on and
// which XDR engineering subjects have been covered inside them.
//
// This vocabulary was called "Category" and is now called "Solution", reversing
// a decision recorded here for a while: that "Category" was the plainer word to
// show a reader, and that the values being Microsoft products was a detail the
// name did not need to carry. The reverse is true for what this blog is for. Read
// as a portfolio, the product an entry is built on is the strongest signal in it,
// and "Category" is the one word in the taxonomy that could mean anything - it
// named the vocabulary's shape rather than its content. "Solution" names the
// content, which is what makes it worth the URL move from /categories to
// /solutions that came with it.
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
	/**
	 * Entries in the rail's first block, newest first - the one headed "Recent
	 * Labs". Named for the count rather than for the heading, because these are
	 * ordinary blog entries: there is no labs collection behind that label. See the
	 * note in Sidebar.astro.
	 *
	 * Three, so the block reads as a glance back rather than as a second ledger
	 * beside the first one. It does repeat the top of the list on page 1 of the
	 * home page - a known cost, taken deliberately; see the note in Sidebar.astro.
	 *
	 * This replaces sidebarTagCount, which capped a "Popular Tags" block that
	 * merged both vocabularies and ranked them by volume. That block is gone. The
	 * rail's facet list is now the solutions, which is the one list the header menu
	 * cannot show, and a shortlist of topics beside it duplicated what the menu
	 * already does systematically. Nothing caps the solutions block: SOLUTIONS is
	 * nine values, only the published ones render, so the catalogue is the ceiling.
	 */
	sidebarRecentCount: 3,
	/**
	 * Taxonomy values a ledger row's meta line carries before the reading time.
	 *
	 * Three, which is what fits on one line beside the reading time in the copy
	 * column at the widths that matter. The row leads with the solution above the
	 * title, so this is the budget for the area and the topics beneath it - and a
	 * cap is what keeps the line a caption rather than the tag cloud EntryMeta.astro
	 * has always argued against. The full list is on the entry page.
	 */
	rowFacetCount: 3,
} as const;

/**
 * Solution: the Microsoft security product or service an entry is about. One or
 * more per entry, the first being the primary one - that is the one a ledger row
 * leads with, so order inside an entry's `solutions` list is meaningful.
 *
 * The order here is the platform trio first - the SIEM, the directory, the device
 * management control plane - then the Defender family: the umbrella, then its
 * workloads in scope order, device, identity, collaboration, SaaS, cloud estate.
 * Facet lists render in this order rather than by volume, so the article count
 * does not dictate the narrative. Solutions with nothing published are filtered
 * out at render time rather than removed from this list, so one can be written
 * towards before it appears anywhere - which is the state Intune and Defender XDR
 * are in today, and why neither shows up on the site yet.
 *
 * "Microsoft Defender XDR" is back after being removed, and the reason it was
 * removed is still true and still worth reading: the umbrella covers every
 * Defender workload below it, so tagging an entry with it says little beyond
 * "this is a security product" while competing with the specific workload the
 * writing is actually about. The old note said to reconsider if an entry were
 * ever really about the unified portal rather than a workload in it. Two things
 * arrived at once - that entry, and this vocabulary becoming Solution rather than
 * Category, under which the unified platform is a product in its own right and
 * not a redundant parent of the list. So it earns a place, with the original
 * hazard carried forward as the usage rule: reach for it only when the entry is
 * about the portal or genuinely spans workloads, never as the default for
 * anything Defender-shaped.
 *
 * Intune is here for the same portfolio reason and sits with Entra ID rather than
 * with the Defender workloads: it is the device management control plane paired
 * with the directory, not a detection product. It is also the one value in this
 * list whose primary job is management rather than security, which is a fair
 * thing to argue about - it stays because compliance state and app protection are
 * what Conditional Access actually gates on, so endpoint management is inside the
 * security story rather than beside it.
 *
 * Full product names, "Microsoft " prefix included. A solution names a product,
 * so it should name it the way its vendor does rather than in a shorthand the
 * reader has to expand. The pair to watch is Defender for Cloud Apps and
 * Defender for Cloud - near-identical names for different products - and the
 * prefix does nothing to separate those two; only reading to the last word does,
 * which is a cost this vocabulary carries either way.
 *
 * Spelled as Microsoft spells them, checked against Microsoft's own lists rather
 * than from memory:
 * https://learn.microsoft.com/defender-xdr/microsoft-365-defender
 * https://learn.microsoft.com/azure/sentinel/overview
 * https://learn.microsoft.com/intune/fundamentals/what-is-intune
 *
 * These entries carried an `icon` and a `color` too - a Material glyph, tinted
 * per product, drawn beside the label in the header menu and inside the tag.
 * Both are gone, along with the component that held the glyphs. They were
 * generic shapes standing in for marks that cannot be shipped, so they
 * identified nothing on their own, and three of the seven values then in this
 * list shared the same slate, so the tint was a mapping no reader could learn.
 * Removing them is also what makes the longer labels affordable: the width the
 * glyph gives back pays for part of the prefix.
 *
 * Note that the labels are the URLs: the archive is /solutions/microsoft-entra-id.
 */
export const SOLUTIONS = [
	{ label: 'Microsoft Sentinel' },
	{ label: 'Microsoft Entra ID' },
	{ label: 'Microsoft Intune' },
	{ label: 'Microsoft Defender XDR' },
	{ label: 'Microsoft Defender for Endpoint' },
	{ label: 'Microsoft Defender for Identity' },
	{ label: 'Microsoft Defender for Office 365' },
	{ label: 'Microsoft Defender for Cloud Apps' },
	{ label: 'Microsoft Defender for Cloud' },
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

export type Solution = (typeof SOLUTIONS)[number];
export type SolutionLabel = Solution['label'];
export type TopicLabel = (typeof TOPICS)[number]['label'];

/** The five glyphs TopicGroupIcon.astro carries, one per group. */
export type TopicGroupIconName = 'person' | 'computer' | 'cloud' | 'shield' | 'build';

/**
 * A discipline: the broad area of security work an entry belongs to, rather than
 * the product it uses or the subject it covers.
 *
 * The five doors the header menu opens onto. This is a layer *over* the two
 * vocabularies rather than a third one beside them, which is the whole design:
 * nothing in frontmatter names a group, so no entry has to be re-tagged and no
 * entry can be filed into the wrong one by hand. Membership is derived - an entry
 * is in a group if it carries any of that group's topics or any of its
 * solutions - so the filing follows from the tags an author was already writing.
 *
 * That derivation is also why a group can be defined against whichever vocabulary
 * actually describes it. Identity and Endpoint are natural topic sets; Cloud has
 * no topics at all and is entirely the two cloud products, because the subject
 * vocabulary has never needed a word for "this is about the cloud estate" when the
 * solution already said so.
 */
export interface TopicGroup {
	label: string;
	icon: TopicGroupIconName;
	/** Topics that put an entry in this group. May be empty. */
	topics: readonly TopicLabel[];
	/** Solutions that put an entry in this group. May be empty. */
	solutions: readonly SolutionLabel[];
}

/**
 * Ordered as the reader meets the estate rather than by volume: the two things
 * being defended (identities, then devices), the place they live (the cloud
 * estate), then the two disciplines applied across all of it - running the
 * detections, and building them.
 *
 * Groups with nothing published are dropped at render time rather than removed
 * from this list, so one can be written towards before it appears anywhere. Cloud
 * is in exactly that state today: both of its entries are drafts.
 *
 * An entry belongs to as many of these as its tags reach, and most reach two or
 * three. That is correct rather than sloppy - a KQL hunt across sign-in logs is
 * genuinely identity work, security operations and security engineering at once -
 * and it is why these are doors into the archive and not a place to look up how
 * many entries "really" belong to a discipline. The counts on /topics are per
 * subject, which is the number that means something.
 *
 * Every published entry must land in at least one group, or it becomes reachable
 * only through its own tags. Nothing enforces that: it holds for the current
 * catalogue because every topic below is claimed by exactly one group, so check it
 * again if a topic is ever added to TOPICS without being added here.
 */
export const TOPIC_GROUPS: readonly TopicGroup[] = [
	{
		label: 'Identity',
		icon: 'person',
		topics: [
			'Authentication',
			'Conditional Access',
			'External Access',
			'Guest Accounts',
			'Identity Investigation',
			'Identity Protection',
			'Privileged Access',
		],
		solutions: ['Microsoft Entra ID', 'Microsoft Defender for Identity'],
	},
	{
		// Intune is here as well as Defender for Endpoint: managing a device and
		// defending it are the same estate, and an entry about compliance policy or
		// app protection is endpoint work whichever console it was done in. Changes
		// nothing today - no entry carries Intune yet - so this is the group the
		// first one will land in rather than a claim about the current catalogue.
		label: 'Endpoint',
		icon: 'computer',
		topics: [
			'Attack Surface Reduction',
			'Device Investigation',
			'Device Onboarding',
			'Endpoint Hardening',
		],
		solutions: ['Microsoft Defender for Endpoint', 'Microsoft Intune'],
	},
	{
		// No topics, and not an omission - see the note on TopicGroup above.
		label: 'Cloud',
		icon: 'cloud',
		topics: [],
		solutions: ['Microsoft Defender for Cloud', 'Microsoft Defender for Cloud Apps'],
	},
	{
		// Sentinel is the SIEM the operations work happens in, so the product carries
		// the group as well as the topics do. Defender for Office 365 is deliberately
		// not listed: its entries reach this group through Incident Investigation and
		// Detection Tuning, and claiming the whole product for operations would file
		// mail-flow configuration work as an analyst's.
		//
		// Microsoft Defender XDR is not listed either, and for a bigger reason: the
		// unified portal spans every group below and above this one, so claiming it
		// for any single group would misfile, and listing it in all four would let one
		// tag drag an entry into the whole menu. Its entries reach the right groups
		// through their topics, which is what the derivation is for.
		label: 'Security Operations',
		icon: 'shield',
		topics: ['Advanced Hunting', 'Detection Tuning', 'Incident Investigation'],
		solutions: ['Microsoft Sentinel'],
	},
	{
		// Topics only. Building a detection is a discipline rather than a product -
		// it happens in Sentinel and in Defender alike - so a solution here would
		// pull in every entry about the tool instead of the ones about the building.
		label: 'Security Engineering',
		icon: 'build',
		topics: ['Analytics Rules', 'Data Collection', 'Detection Engineering', 'KQL'],
		solutions: [],
	},
];

// z.enum() needs a non-empty tuple, hence the assertions.
export const SOLUTION_LABELS = SOLUTIONS.map((s) => s.label) as [SolutionLabel, ...SolutionLabel[]];
export const TOPIC_LABELS = TOPICS.map((t) => t.label) as [TopicLabel, ...TopicLabel[]];

// Plain header links, rendered after the Topics menu.
//
// Two entries, and the header is still meant to stay this short. The rule it was
// written to enforce holds unchanged: nothing in here may be a second name for a
// page the reader can already reach. Home is not in here because the brand links
// to it, and an Articles link is not either because home *is* the article feed.
//
// Search is in here because it is a way into the archive rather than a duplicate
// of one, which makes it a peer of the Topics menu beside it - the site's only
// other discovery control - rather than another name for the ledger. It went here
// and not into the footer for the plain reason that a search page nobody can find
// is not a search page. Solutions are deliberately NOT in the header: they live in
// the rail and in the search filters, where the list can be complete.
//
// The disclaimer is not in here. It is a legal page rather than a destination, so
// it sits in the footer beside the rest of the small print, and /about is a short
// page about the blog. Both were the same file until that change, which is why
// /about used to be labelled "Disclaimer" here.
export const NAV = [
	{ href: '/search', label: 'Search' },
	{ href: '/about', label: 'About' },
] as const;
