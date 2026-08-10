// Reading-time estimation computed from a collection entry's raw markdown body.
//
// Astro's official recipe uses a remark plugin exposing `minutesRead` via
// `remarkPluginFrontmatter`, but that value only exists after render(entry).
// The ledger shows a read time on every row, so using the recipe would mean
// rendering every post just to build a list. `entry.body` gives us the raw
// markdown without rendering, so we count from that instead.
// Recipe for reference: https://docs.astro.build/en/recipes/reading-time/

const WORDS_PER_MINUTE = 200;
/** Code is skimmed, not read, but slower per line than prose. */
const CODE_LINES_PER_MINUTE = 25;

const FENCED_CODE = /```[\s\S]*?```/g;

/**
 * Approximate minutes to read a markdown body.
 *
 * Prose and code are counted separately because a query pack that is 80% KQL
 * would otherwise report a misleadingly short time.
 */
export function readingTimeMinutes(markdown: string | undefined): number {
	if (!markdown) return 1;

	const codeBlocks = markdown.match(FENCED_CODE) ?? [];
	const codeLines = codeBlocks
		.join('\n')
		.split('\n')
		.filter((line) => line.trim() && !line.trim().startsWith('```')).length;

	const prose = markdown
		.replace(FENCED_CODE, ' ')
		.replace(/`[^`]*`/g, ' ')
		// Keep link and image text, drop the URL.
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/^\s{0,3}[#>]+\s*/gm, ' ')
		.replace(/[*_~|]/g, ' ');

	const words = prose.split(/\s+/).filter(Boolean).length;

	return Math.max(1, Math.round(words / WORDS_PER_MINUTE + codeLines / CODE_LINES_PER_MINUTE));
}
