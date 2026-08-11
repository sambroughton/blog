// The hover wash on a ledger row is a radial gradient held under two scrims and
// a low opacity - see .entry-row in global.css for the geometry and the timings.
//
// The gradient is generated rather than listed, so the ramp spans whatever the
// list actually is: t runs 0 at the first row to 1 at the last, and hue walks
// indigo -> steel -> cyan down the page. A five-entry list and a fifty-entry list
// both get the full sweep, and nothing cycles or repeats.
//
// Written in oklch because the ramp holds lightness constant (0.30 near, 0.19
// mid) while only chroma and hue move. In sRGB that is not expressible: equal hex
// steps at fixed lightness drift in perceived brightness, and the mid stops would
// read as unevenly dark. Tailwind v4 already ships an oklch default palette, so
// the browser support this needs is support the site already requires.
//
// The last stop is rgb(var(--reveal-ground)) rather than a literal. That custom
// property is set on .entry-row and must track --color-bg, so every tint resolves
// into the page ground - a literal here would show as a pale band at the
// right-hand end of every row the moment the ground changed.

/**
 * The `deepest` of the depth presets, and the only one carried over: the shallower
 * ones washed out once the reveal opacity came down to 0.60.
 *
 * Lightness is fixed per stop. Chroma falls as t rises, so the cyan end of the
 * ramp is slightly less saturated than the indigo end - at equal chroma the
 * cyan-ish hues read louder, and the list wants an even weight top to bottom.
 */
const DEEPEST = {
	nearLightness: 0.3,
	nearChroma: (t: number) => 0.16 - 0.03 * t,
	midLightness: 0.19,
	midChroma: (t: number) => 0.11 - 0.02 * t,
	hue: (t: number) => 232 - 42 * t,
} as const;

/**
 * The wash gradient for the row at `index` of a list of `total` rows.
 *
 * @param index Zero-based position in the rendered list.
 * @param total How many rows the list has, which sets the span of the ramp.
 */
export function entryTint(index: number, total: number): string {
	// A single-row list is the common case here, not a curiosity: every /domains
	// and /topics page with one entry hits it, and i/(n-1) is a divide by zero
	// there. That row takes t = 0, the deepest indigo, which is also what the top
	// of a long list gets. Non-finite inputs land in the same place rather than
	// propagating NaN into a colour function, where it would kill the wash.
	const spannable = Number.isFinite(index) && Number.isFinite(total) && total > 1;
	// Clamped, so an index past the end of the list holds the last colour instead
	// of running the ramp past cyan into greens.
	const t = spannable ? Math.min(Math.max(index / (total - 1), 0), 1) : 0;

	const hue = round(DEEPEST.hue(t));
	const near = `oklch(${DEEPEST.nearLightness} ${round(DEEPEST.nearChroma(t))} ${hue})`;
	const mid = `oklch(${DEEPEST.midLightness} ${round(DEEPEST.midChroma(t))} ${hue})`;

	return `radial-gradient(120% 140% at 12% 50%, ${near} 0%, ${mid} 44%, rgb(var(--reveal-ground)) 100%)`;
}

// Four decimals is past the point a channel can resolve, and it keeps the inline
// style attribute from carrying floating-point noise like 0.14500000000000002.
function round(value: number): number {
	return Math.round(value * 10000) / 10000;
}
