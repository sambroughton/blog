// Breadcrumb trail types.
//
// Trails are passed in by each page rather than derived from Astro.url, because
// the readable label for a segment is never in the path: /solutions/microsoft-entra-id
// has to become "Microsoft Entra ID", and a post's slug carries no title at all.
// Deriving them would mean reversing slugify(), which is lossy, or a second lookup
// table that could drift from consts.ts.

export interface Crumb {
	/** Text shown for this step. */
	label: string;
	/**
	 * Site-root-relative path, passed through withBase() at render time. Omit on
	 * the last crumb: the page you are already on is not a link.
	 */
	href?: string;
}
