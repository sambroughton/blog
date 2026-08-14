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
// The two are no longer symmetrical, and that asymmetry is the point. Solutions
// are navigation - the header menu, an index at /solutions and an archive per
// product. Topics are description - tags a reader reads on a row or an entry
// page, with no link on them and no route behind them. Projects is the single
// exception, routed at /projects; see PROJECTS_TOPIC below.
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
	 * Projects". Named for the count rather than for the heading, because these are
	 * ordinary blog entries carrying the Projects topic: there is no projects
	 * collection behind that label. See the note in Sidebar.astro.
	 *
	 * Three, so the block reads as a glance back rather than as a second ledger
	 * beside the first one. It no longer repeats the top of the ledger, which it did
	 * while this block was the newest entries whatever their tag: the ledger is
	 * articles and this is projects, and the two lists are disjoint.
	 *
	 * This replaces sidebarTagCount, which capped a "Popular Tags" block that
	 * merged both vocabularies and ranked them by volume. That block is gone, and so
	 * is the Solutions block that briefly replaced it: the products are the header
	 * menu now, and a rail listing them beside every page said the same thing a
	 * second time. What is left in the rail is what the header cannot carry - what
	 * is new, and when.
	 */
	sidebarRecentCount: 3,
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
 * Labels only, and deliberately not destinations. Topics are tags a reader reads
 * rather than follows: they are rendered as plain text everywhere on the site, and
 * there is no /topics route, no topics index and no per-topic archive. That is a
 * reversal, and the reason is that a blog this size did not have enough behind each
 * subject to justify a page per subject plus the slug and breadcrumb machinery
 * underneath it. The product is what a reader navigates by now - see SOLUTIONS
 * above and the header menu built from it - and the topics say what a given entry
 * is about once they have found it.
 *
 * The one exception is Projects, and it is an exception in the routing rather than
 * in the vocabulary: /projects lists the entries carrying it. It is a topic like
 * any other so that an entry declares itself a project the same way it declares
 * everything else, in `topics`, rather than through a second flag in frontmatter or
 * a collection of its own.
 *
 * It is also the one topic that is not a subject. Everything else in this list
 * names something an entry is *about*; Projects names what an entry *is* - a piece
 * of work built and written up, rather than a note on a product. That is a real
 * inconsistency in the vocabulary and it is the price of not adding a third field
 * to frontmatter for one distinction. Worth revisiting if a second value ever wants
 * the same treatment, because two of these would make it a vocabulary rather than
 * an exception.
 *
 * Alphabetical, because there is nothing to group them by and a reader scanning
 * for a known subject is looking one up rather than browsing a progression. These
 * previously named a parent domain, which existed only to group the topics index;
 * both are gone.
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
	{ label: 'Projects' },
] as const;

export type Solution = (typeof SOLUTIONS)[number];
export type SolutionLabel = Solution['label'];
export type TopicLabel = (typeof TOPICS)[number]['label'];

/**
 * The topic /projects is built from. Here rather than inlined at the route so the
 * string exists once: it has to match a TOPICS label exactly or the page silently
 * lists nothing, and `satisfies TopicLabel` is what makes a typo a build error
 * instead of an empty page.
 */
export const PROJECTS_TOPIC = 'Projects' satisfies TopicLabel;

/* Removed: TopicGroup, TopicGroupIconName and TOPIC_GROUPS - the five disciplines
   (Identity, Endpoint, Cloud, Security Operations, Security Engineering) that the
   header menu opened onto, derived from each entry's topics and solutions rather
   than declared in frontmatter.

   Worth saying why, because the derivation was the good part and is what would be
   worth rebuilding: nothing had to be tagged with a group by hand, so no entry
   could be filed into the wrong one. What did not hold up was the layer itself.
   Three vocabularies on one row - area, product, subject - is more classification
   than a blog of this size has entries, and the group archives lived at
   /topics/<slug> alongside the per-topic ones, which is where the slug collision
   guard and the two-shaped breadcrumb came from. Both are gone with them.

   The header menu is the solutions now. That is one list, it is the vocabulary a
   reader actually navigates by, and it needs no derivation because an entry names
   its products outright. */

// z.enum() needs a non-empty tuple, hence the assertions.
export const SOLUTION_LABELS = SOLUTIONS.map((s) => s.label) as [SolutionLabel, ...SolutionLabel[]];
export const TOPIC_LABELS = TOPICS.map((t) => t.label) as [TopicLabel, ...TopicLabel[]];

// Plain header links, rendered after the Solutions menu.
//
// Three entries, and the header is still meant to stay this short. The rule it was
// written to enforce holds unchanged: nothing in here may be a second name for a
// page the reader can already reach. Home is not in here because the brand links
// to it, and an Articles link is not either because home *is* the article feed.
//
// Projects is in here because nothing else names it. It is a listing of the
// entries carrying the Projects topic - see PROJECTS_TOPIC above - and with topics
// no longer routed at all, this link and the rail's "Recent Projects" heading are
// the only two ways to it. It goes first because it is a slice of the writing,
// which puts it nearer the ledger than the two utility pages after it.
//
// Search is in here because it is a way into the archive rather than a duplicate
// of one, which makes it a peer of the Solutions menu beside it. It went here and
// not into the footer for the plain reason that a search page nobody can find is
// not a search page.
//
// The disclaimer is not in here. It is a legal page rather than a destination, so
// it sits in the footer beside the rest of the small print, and /about is a short
// page about the blog. Both were the same file until that change, which is why
// /about used to be labelled "Disclaimer" here.
export const NAV = [
	{ href: '/projects', label: 'Projects' },
	{ href: '/search', label: 'Search' },
	{ href: '/about', label: 'About' },
] as const;
