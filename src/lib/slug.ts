/**
 * The one place a taxonomy label becomes a URL segment.
 *
 * Entries carry display labels ("Microsoft Entra ID", "KQL") and every archive
 * route is keyed by the slug of one, so this function is what decides whether
 * /solutions/microsoft-entra-id resolves. Both sides of every comparison go
 * through it - the getStaticPaths param and the link that points at it - so a
 * change here moves both together and cannot leave a link pointing at a route
 * that no longer generates.
 *
 * Deliberately narrow: lowercase, collapse every run of non-alphanumerics to a
 * single hyphen, trim hyphens off both ends. No transliteration and no stopword
 * stripping, because the vocabulary in consts.ts is ASCII product and subject
 * names and anything cleverer would be untestable guesswork against labels that
 * do not exist yet.
 *
 * The slugs it produces for the current catalogue are the same ones the previous
 * hand-written ids used, which is what keeps /topics/kql and the rest resolving
 * after the migration:
 *
 *   'KQL'                      -> 'kql'
 *   'Microsoft Entra ID'       -> 'microsoft-entra-id'
 *   'Conditional Access'       -> 'conditional-access'
 *   'Microsoft Defender XDR'   -> 'microsoft-defender-xdr'
 *   'Microsoft Defender for Office 365' -> 'microsoft-defender-for-office-365'
 *
 * The Defender XDR line was a hypothetical when it was written and is now a live
 * value - it went back into SOLUTIONS when that vocabulary stopped being called
 * Category. The slug it produces is unchanged, which is the point of listing it.
 */
export function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
