/**
 * Display formatting for dashboard figures.
 * Money is carried as integer paise (never floating-point rupees) and only
 * turned into a string at the edge.
 */

export type Paise = number;

const groupIN = (n: number) => n.toLocaleString("en-IN");

/** ₹12,34,567.89 */
export function formatINR(paise: Paise, opts: { decimals?: boolean } = {}): string {
  const { decimals = true } = opts;
  const sign = paise < 0 ? "−" : "";
  const abs = Math.abs(Math.trunc(paise));
  const rupees = Math.trunc(abs / 100);
  const rem = String(abs % 100).padStart(2, "0");
  return `${sign}₹${groupIN(rupees)}${decimals ? `.${rem}` : ""}`;
}

/** Indian compact notation: ₹4.2K, ₹3.18L, ₹1.2Cr */
export function formatINRCompact(paise: Paise): string {
  const sign = paise < 0 ? "−" : "";
  const rupees = Math.abs(Math.trunc(paise / 100));
  const fmt = (v: number, unit: string) => `${sign}₹${trimZero(v.toFixed(v >= 100 ? 0 : v >= 10 ? 1 : 2))}${unit}`;
  if (rupees >= 1_00_00_000) return fmt(rupees / 1_00_00_000, "Cr");
  if (rupees >= 1_00_000) return fmt(rupees / 1_00_000, "L");
  if (rupees >= 1_000) return fmt(rupees / 1_000, "K");
  return `${sign}₹${rupees}`;
}

export function formatCount(n: number): string {
  return groupIN(n);
}

/** Signed percentage change, e.g. +8.4% */
export function formatDelta(pct: number): string {
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
}

function trimZero(s: string): string {
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}
