import { fetchJson } from "./client";

const API_BASE = (import.meta.env.VITE_API_URL ?? "");

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
  beta: number;
  profitUsd: number;
  systematicRiskAnnualPct: number;
  unsystematicRiskAnnualPct: number;
  aumUsd: number;
  initialCapitalUsd: number;
  benchmarkName: string;
  since: string;
};

export type PositionRow = {
  ticker: string;
  shares: number;
  entryPrice: number;
  currentPrice: number;
  entryValue: number;
  marketValue: number;
  currentWeight: number;
  pnlUsd: number;
  returnPct: number;
};

export type PositionsResponse = {
  asOf: string;
  entryDateUsed: string;
  valuationDate: string;
  initialCapitalUsd: number;
  aumUsd: number;
  positions: PositionRow[];
  missingTickersDropped: string[];
  weightsRenormalized: boolean;
};

export type HoldingsResponse = {
  asOf: string;
  holdings: {
    ticker: string;
    name: string;
    weight: number;
    targetWeight?: number;
    shares?: number;
  }[];
};

export function getPerformance(range: RangeKey) {
  const rangeMap: Record<RangeKey, string> = {
    "1M": "1m",
    "3M": "3m",
    "1Y": "1y",
    "MAX": "max",
  };

  return fetchJson<PerformanceResponse>(
    `${API_BASE}/performance/${rangeMap[range]}`
  );
}

export async function getMetrics() {
  const data = await fetchJson<MetricsResponse>(`${API_BASE}/metrics`);
  return {
    ...data,
    profitUsd: data.aumUsd - data.initialCapitalUsd,
  };
}

export function getHoldings() {
  return fetchJson<HoldingsResponse>(`${API_BASE}/holdings`);
}

export function getPositions() {
  return fetchJson<PositionsResponse>(`${API_BASE}/positions`);
}
