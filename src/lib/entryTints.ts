// The hover wash on a ledger row: one radial gradient, the same on every row.
// Geometry, scrims and timings live in .entry-row in global.css.
//
// Constant rather than a per-row ramp. The ramp that was here walked hue down the
// page and was invisible - first row to last measured an Oklab dE of 0.0089
// against a side-by-side JND of about 0.02. A version with real separation was
// then built and also dropped: rows light one at a time and seconds apart, so a
// ramp has nothing to be compared against. Restore one only with a reason that
// survives that.
//
// Both stops sit inside sRGB at hue 265, where the chroma ceiling is 0.235 at
// L 0.34 and 0.147 at L 0.21. Raise either chroma past those and the browser
// gamut-maps it, painting something other than what is written here. Hue 265 is
// also a few degrees off the accent bar's #4d7cfe, so the bar reads as part of
// the wash rather than a second colour on top of it.
//
// The last stop must stay rgb(var(--reveal-ground)), which .entry-row sets to
// track --color-bg: a literal would show as a pale band at the right-hand end of
// every row the moment the ground changed.

/** Set per row as --entry-tint, so reintroducing variation is a change to this file alone. */
export const ENTRY_TINT =
	'radial-gradient(120% 140% at 12% 50%, oklch(0.34 0.05 265) 0%, oklch(0.21 0.035 265) 44%, rgb(var(--reveal-ground)) 100%)';
