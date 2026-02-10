import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHoldings, getPositions } from "../api/queries";
import { Card } from "../components/Card";

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
function pct(n: number, digits = 2) {
  return `${n.toFixed(digits)}%`;
}
function clsGain(n: number) {
  return n >= 0 ? "text-emerald-600" : "text-red-600";
}

export function Holdings() {
  const posQ = useQuery({ queryKey: ["positions"], queryFn: getPositions });
  const holQ = useQuery({ queryKey: ["holdings"], queryFn: getHoldings });

  const joined = useMemo(() => {
    if (!posQ.data) return [];

    const byTicker = new Map<string, { name?: string; targetWeight?: number }>();
    if (holQ.data) {
      for (const h of holQ.data.holdings) {
        byTicker.set(h.ticker, { name: h.name, targetWeight: h.targetWeight });
      }
    }

    return [...posQ.data.positions]
      .map((p) => {
        const extra = byTicker.get(p.ticker);
        const targetWeight = extra?.targetWeight ?? undefined;
        const drift =
          targetWeight == null ? undefined : (p.currentWeight - targetWeight) * 100.0;

        return {
          ...p,
          name: extra?.name ?? p.ticker,
          targetWeight,
          driftPct: drift,
        };
      })
      .sort((a, b) => b.marketValue - a.marketValue);
  }, [posQ.data, holQ.data]);

  const isLoading = posQ.isLoading || holQ.isLoading;
  const isError = posQ.isError || holQ.isError;

  const totalWeightShown = joined.reduce((s, x) => s + (x.currentWeight ?? 0), 0) * 100;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Portfolio Holdings</h1>
        <p className="text-lg text-slate-600">
          Each position’s shares, value, performance, and weight drift vs target.
        </p>
      </header>

      <Card className="p-6">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Failed to load holdings/positions.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
              <div>
                As of <span className="font-medium text-slate-800">{posQ.data!.asOf}</span>{" "}
                (valuation date{" "}
                <span className="font-medium text-slate-800">{posQ.data!.valuationDate}</span>)
              </div>
              <div>
                {joined.length} holdings representing{" "}
                <span className="font-medium text-slate-800">{pct(totalWeightShown, 1)}</span> of
                portfolio
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {joined.map((p) => {
                const gainColor = clsGain(p.pnlUsd);
                const driftText =
                  p.targetWeight == null
                    ? "—"
                    : `${pct((p.targetWeight ?? 0) * 100, 2)} → ${pct(
                        p.currentWeight * 100,
                        2
                      )} (${p.driftPct! >= 0 ? "+" : ""}${p.driftPct!.toFixed(2)}pp)`;

                return (
                  <div
                    key={p.ticker}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="text-xl font-semibold text-slate-900">{p.ticker}</div>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            Equity
                          </span>
                        </div>
                        <div className="mt-1 text-slate-600">{p.name}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-semibold text-slate-900">
                          {pct(p.currentWeight * 100, 2)}
                        </div>
                        <div className="text-sm text-slate-500">of portfolio</div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
                      <div>
                        <div className="text-xs text-slate-500">Shares</div>
                        <div className="mt-1 font-semibold text-slate-900">
                          {p.shares.toFixed(6)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Avg Cost</div>
                        <div className="mt-1 font-semibold text-slate-900">{usd(p.entryPrice)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Current Price</div>
                        <div className="mt-1 font-semibold text-slate-900">{usd(p.currentPrice)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Total Gain</div>
                        <div className={`mt-1 font-semibold ${gainColor}`}>
                          {p.pnlUsd >= 0 ? "+" : ""}
                          {usd(p.pnlUsd)}{" "}
                          <span className="text-xs">
                            ({p.returnPct >= 0 ? "+" : ""}
                            {pct(p.returnPct, 2)})
                          </span>
                        </div>
                      </div>
                      <div className="md:text-right">
                        <div className="text-xs text-slate-500">Target → Current</div>
                        <div className="mt-1 font-semibold text-slate-900">{driftText}</div>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-600">Position Value</div>
                        <div className="font-semibold text-slate-900">{usd(p.marketValue)}</div>
                      </div>

                      {/* allocation bar */}
                      <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{
                            width: `${Math.max(0, Math.min(100, p.currentWeight * 100))}%`,
                          }}
                          aria-label={`${p.ticker} allocation ${pct(p.currentWeight * 100, 2)}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
