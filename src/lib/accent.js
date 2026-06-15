// Per-timeline accent color. The default matches the app's indigo brand.
export const DEFAULT_ACCENT = '#6366f1'

// A small curated palette offered in the timeline settings color picker.
export const ACCENT_PRESETS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // amber
  '#22c55e', // green
  '#14b8a6', // teal
  '#0ea5e9', // sky
  '#64748b', // slate
]

// Mix an accent color with transparency using CSS color-mix so a single hex
// can drive solid fills, soft tracks, and glows without extra variables.
export const accentAlpha = (color, percent) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`
