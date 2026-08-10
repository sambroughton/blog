// Single source of truth for site identity and taxonomy.
// The topic list here is compiled into the content-collection schema, so
// adding a value means adding it here and nowhere else.

export const SITE = {
	name: "Sam's Blog",
	tagline: 'Notes from the field on Microsoft security engineering.',
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
 * Topic: the subject area. Exactly one per entry, so counts stay meaningful and
 * the sidebar is stable.
 */
export const TOPICS = [
	{ id: 'identity', label: 'Identity' },
	{ id: 'endpoint-security', label: 'Endpoint Security' },
	{ id: 'siem-detection', label: 'SIEM & Detection' },
	{ id: 'cloud-security', label: 'Cloud Security' },
	{ id: 'data-security', label: 'Data Security' },
	{ id: 'device-management', label: 'Device Management' },
] as const;

export type TopicId = (typeof TOPICS)[number]['id'];

// z.enum() needs a non-empty tuple, hence the assertion.
export const TOPIC_IDS = TOPICS.map((t) => t.id) as [TopicId, ...TopicId[]];

export function topicLabel(id: TopicId): string {
	return TOPICS.find((t) => t.id === id)?.label ?? id;
}

export const NAV = [
	{ href: '/topics', label: 'Topics' },
	{ href: '/about', label: 'About' },
] as const;
