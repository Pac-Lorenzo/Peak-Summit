import { fetchJson } from "./client";

export type RangeKey = "1M" | "3M" | "1Y" | "MAX";

export type PerformancePoint = {
  date: string;
  portfolio: number;
  benchmark: number;
};

export type PerformanceResponse = {
  range: string;
  points: PerformancePoint[];
};

export type MetricsResponse = {
  totalReturnPct: number;
  ytdReturnPct: number;
  sharpe: number;
  aumUsd: number;
  benchmarkName: string;
  since: string;
};

export type HoldingsResponse = {
  asOf: string;
  holdings: { ticker: string; name: string; weight: number }[];
};

export function getPerformance(range: RangeKey) {
  const file =
    range === "1M" ? "performance.1m.json" :
    range === "3M" ? "performance.3m.json" :
    range === "1Y" ? "performance.1y.json" :
    "performance.max.json";

  return fetchJson<PerformanceResponse>(`/data/${file}`);
}

export function getMetrics() {
  return fetchJson<MetricsResponse>("/data/metrics.json");
}

export function getHoldings() {
  return fetchJson<HoldingsResponse>("/data/holdings.json");
}
