// The hover wash on a ledger row is a radial gradient held under two scrims and
// a low opacity - see .entry-row in global.css for the geometry and the timings.
//
// One colour, the same on every row. This used to be a generated ramp: t ran 0 at
// the first row to 1 at the last, and hue walked indigo -> cyan down the page. It
// was invisible, and measurably so. Composited, the first row and the last
// differed by an Oklab dE of 0.0089, against a side-by-side just-noticeable
// difference of roughly 0.02 - the whole archive-length sweep sat several times
// below the threshold at which two swatches can be told apart while touching.
//
// The cause was gamut. sRGB has almost no chroma in the blue-to-cyan arc at these
// lightnesses: the ceiling at L 0.30 runs 0.049 at hue 200 to 0.066 at hue 240,
// because a saturated cyan needs green and green carries luminance, so it cannot
// exist this dark. Every stop asked for 0.13-0.16 and was gamut-mapped back to
// 0.053-0.062, about 40% of what was written. Both ends landed on the same gamut
// wall at nearly the same saturation, which is what flattened the ramp.
//
// A ramp along an axis with room - fixed hue, chroma draining down the page - does
// reach dE 0.043 end to end and steps evenly. It was built and then dropped,
// because it still would not have been perceived as a ramp: rows light one at a
// time and seconds apart, and cross-temporal discrimination needs far more than
// the side-by-side 0.02. The value below is that ramp's drained end, applied
// throughout. Anyone hovering rows in sequence sees what they saw before; the
// per-row generator, the index and total plumbing and the /search ordering
// question all go away.
//
// Written in oklch because the two stops hold one hue and differ only in
// lightness and chroma, which is the relationship being expressed. Tailwind v4
// already ships an oklch default palette, so the browser support this needs is
// support the site already requires.
//
// Both stops are inside sRGB - the ceiling at hue 265 is 0.235 at L 0.34 and
// 0.147 at L 0.21 - so what is written is what gets painted, with nothing being
// mapped. Raising either chroma means rechecking against those ceilings.
//
// Hue 265 is within a few degrees of the accent bar's #4d7cfe, so the bar reads as
// part of the wash rather than as a second colour sitting on top of it.
//
// The last stop is rgb(var(--reveal-ground)) rather than a literal. That custom
// property is set on .entry-row and must track --color-bg, so the tint resolves
// into the page ground - a literal here would show as a pale band at the
// right-hand end of every row the moment the ground changed.

/**
 * The wash gradient for a ledger row. Constant: see the note above for why the
 * per-row ramp this replaced could not be seen.
 *
 * Delivered per row as the --entry-tint custom property rather than written
 * straight into .entry-row__tint, so reintroducing variation is a change to this
 * file alone. .entry-row__tint falls back to transparent without it.
 */
export const ENTRY_TINT =
	'radial-gradient(120% 140% at 12% 50%, oklch(0.34 0.05 265) 0%, oklch(0.21 0.035 265) 44%, rgb(var(--reveal-ground)) 100%)';
