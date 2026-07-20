// Single source of truth for brand color — consumed by Tailwind tokens
// (globals.css mirrors these) and by three.js materials.
export const palette = {
  carbon: "#09090b",
  gunmetal: "#18181b",
  amber: "#f59e0b",
  steel: "#fafaf9",
} as const;

export type PaletteKey = keyof typeof palette;
