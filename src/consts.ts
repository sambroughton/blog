// Single source of truth for site identity and taxonomy.
// The topic list here is compiled into the content-collection schema, so
// adding a value means adding it here and nowhere else.

export const SITE = {
	name: "Sam's Blog",
	tagline: 'Powered by learning. Engineered for defence.',
	description:
		'Field reports, detection queries and deployment notes on Microsoft security engineering: Entra ID, Defender XDR, Sentinel and Azure.',
	author: 'Sam Broughton',
	/** Entries per page in the ledger. The mockup implied 6; 10 means fewer pagination hops. */
	pageSize: 10,
	/** Below this many published entries the sidebar is noise, so it is hidden. */
	sidebarMinEntries: 3,
	/** How many entries the hero carousel shows at most. */
	heroCount: 3,
} as const;

/**
 * Domains: the XDR subject areas this blog covers. Exactly one per entry, so
 * counts stay meaningful and the sidebar is stable.
 *
 * The order here is the intended progression across the discipline, not an
 * alphabetical or by-volume ranking, and it is the order rendered everywhere.
 * Domains with no published entries are filtered out at render time rather than
 * removed from this list, so a domain can be written towards before it appears.
 *
 * The ids are URL slugs (/topics/<id>) and are deliberately left alone when a
 * label is reworded, so existing links keep resolving.
 */
export const TOPICS = [
	{ id: 'endpoint-security', label: 'Endpoint Security' },
	{ id: 'identity', label: 'Identity Security' },
	{ id: 'siem-detection', label: 'SIEM & Detection Engineering' },
	{ id: 'threat-hunting', label: 'Threat Hunting & Incident Response' },
	{ id: 'email-collaboration', label: 'Email & Collaboration Security' },
	{ id: 'cloud-security', label: 'Cloud & SaaS Security' },
	{ id: 'automation-soar', label: 'Automation & SOAR' },
	{ id: 'xdr-engineering', label: 'XDR Engineering & Architecture' },
] as const;

export type TopicId = (typeof TOPICS)[number]['id'];

// z.enum() needs a non-empty tuple, hence the assertion.
export const TOPIC_IDS = TOPICS.map((t) => t.id) as [TopicId, ...TopicId[]];

export function topicLabel(id: TopicId): string {
	return TOPICS.find((t) => t.id === id)?.label ?? id;
}

// The disclaimer keeps the /about path so existing links resolve; only the
// label changed, since the page is no longer a biography.
export const NAV = [
	{ href: '/topics', label: 'Topics' },
	{ href: '/about', label: 'Disclaimer' },
] as const;
