export function fmtPct(x: number) {
  const sign = x > 0 ? "+" : "";
  return `${sign}${x.toFixed(1)}%`;
}
export function fmtUsd(x: number) {
  if (x >= 1_000_000) return `$${(x / 1_000_000).toFixed(1)}M`;
  if (x >= 1_000) return `$${(x / 1_000).toFixed(1)}K`;
  return `$${x.toFixed(0)}`;
}
export function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}
