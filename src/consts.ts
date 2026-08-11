// Single source of truth for site identity and taxonomy.
//
// Three separate vocabularies, each answering a different question about an
// entry, and each compiled into the content-collection schema so a typo fails
// the build rather than silently creating a one-off value:
//
//   Domain      which discipline this belongs to      exactly one per entry
//   Topic       what specific subject it covers       one or more
//   Technology  which product or service is involved  one or more
//
// Adding a value means adding it here and nowhere else.

export const SITE = {
	name: "Sam's Blog",
	tagline: 'Powered by learning. Engineered for defence.',
	/** Short form of the tagline, for the browser tab where space is tight. */
	shortTagline: 'Powered by learning',
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
 * Domain: the broad discipline an entry sits in. Exactly one per entry, so
 * counts stay meaningful and the sidebar is stable.
 *
 * The order here is the intended progression across the discipline, not an
 * alphabetical or by-volume ranking, and it is the order rendered everywhere.
 * Domains with no published entries are filtered out at render time rather than
 * removed from this list, so one can be written towards before it appears.
 *
 * Ids are URL slugs (/domains/<id>) and should be left alone when a label is
 * reworded, so existing links keep resolving.
 */
export const DOMAINS = [
	{ id: 'identity-security', label: 'Identity Security' },
	{ id: 'endpoint-security', label: 'Endpoint Security' },
	{ id: 'siem-detection-engineering', label: 'SIEM & Detection Engineering' },
	{ id: 'threat-hunting-incident-response', label: 'Threat Hunting & Incident Response' },
	{ id: 'cloud-saas-security', label: 'Cloud & SaaS Security' },
	{ id: 'automation-soar', label: 'Automation & SOAR' },
	{ id: 'xdr-engineering-architecture', label: 'XDR Engineering & Architecture' },
] as const;

/**
 * Topic: the specific subject an entry covers. One or more per entry.
 *
 * Each topic names a parent domain, which is only used to group the Topics menu
 * and index. An entry is free to carry a topic whose parent differs from its own
 * domain - detection tuning turns up in endpoint work as readily as in SIEM work.
 */
export const TOPICS = [
	{ id: 'conditional-access', label: 'Conditional Access', domain: 'identity-security' },
	{ id: 'privileged-access', label: 'Privileged Access', domain: 'identity-security' },
	{ id: 'authentication', label: 'Authentication', domain: 'identity-security' },
	{ id: 'identity-protection', label: 'Identity Protection', domain: 'identity-security' },

	{ id: 'advanced-hunting', label: 'Advanced Hunting', domain: 'endpoint-security' },
	{
		id: 'attack-surface-reduction',
		label: 'Attack Surface Reduction',
		domain: 'endpoint-security',
	},
	{ id: 'device-investigation', label: 'Device Investigation', domain: 'endpoint-security' },
	{ id: 'device-onboarding', label: 'Device Onboarding', domain: 'endpoint-security' },

	{ id: 'kql', label: 'KQL', domain: 'siem-detection-engineering' },
	{ id: 'analytics-rules', label: 'Analytics Rules', domain: 'siem-detection-engineering' },
	{ id: 'detection-tuning', label: 'Detection Tuning', domain: 'siem-detection-engineering' },
	{ id: 'data-collection', label: 'Data Collection', domain: 'siem-detection-engineering' },
] as const;

/** Technology: the Microsoft product or service involved. One or more per entry. */
export const TECHNOLOGIES = [
	{ id: 'microsoft-defender-xdr', label: 'Microsoft Defender XDR' },
	{ id: 'microsoft-sentinel', label: 'Microsoft Sentinel' },
	{ id: 'microsoft-entra-id', label: 'Microsoft Entra ID' },
	{ id: 'microsoft-defender-for-endpoint', label: 'Microsoft Defender for Endpoint' },
	{ id: 'microsoft-defender-for-identity', label: 'Microsoft Defender for Identity' },
] as const;

export type DomainId = (typeof DOMAINS)[number]['id'];
export type TopicId = (typeof TOPICS)[number]['id'];
export type TechnologyId = (typeof TECHNOLOGIES)[number]['id'];

// z.enum() needs a non-empty tuple, hence the assertions.
export const DOMAIN_IDS = DOMAINS.map((d) => d.id) as [DomainId, ...DomainId[]];
export const TOPIC_IDS = TOPICS.map((t) => t.id) as [TopicId, ...TopicId[]];
export const TECHNOLOGY_IDS = TECHNOLOGIES.map((t) => t.id) as [TechnologyId, ...TechnologyId[]];

export function domainLabel(id: DomainId): string {
	return DOMAINS.find((d) => d.id === id)?.label ?? id;
}

export function topicLabel(id: TopicId): string {
	return TOPICS.find((t) => t.id === id)?.label ?? id;
}

export function technologyLabel(id: TechnologyId): string {
	return TECHNOLOGIES.find((t) => t.id === id)?.label ?? id;
}

// Plain header links, rendered after the Topics mega-menu. The disclaimer keeps
// the /about path so existing links resolve; only the label changed, since the
// page is no longer a biography.
export const NAV = [{ href: '/about', label: 'Disclaimer' }] as const;
