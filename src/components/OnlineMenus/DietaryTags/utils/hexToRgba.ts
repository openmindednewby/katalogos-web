/**
 * Converts a hex color string to rgba with the given alpha.
 */
const HEX_RADIX = 16;
const R_START = 1;
const R_END = 3;
const G_START = 3;
const G_END = 5;
const B_START = 5;
const B_END = 7;

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(R_START, R_END), HEX_RADIX);
  const g = parseInt(hex.slice(G_START, G_END), HEX_RADIX);
  const b = parseInt(hex.slice(B_START, B_END), HEX_RADIX);
  return `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(alpha)})`;
}
