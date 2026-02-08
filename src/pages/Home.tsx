import { useQuery } from "@tanstack/react-query";
import { getMetrics, getPerformance, type RangeKey } from "../api/queries";
import { MetricTile } from "../components/MetricTile";
import { Card } from "../components/Card";
import { PerformanceChart } from "../components/PerformanceChart";
import { RangeSelector } from "../components/RangeSelector";
import { useMemo, useState } from "react";
import { fmtPct, fmtUsd } from "../lib/format";
import { Link } from "react-router-dom";

export function Home() {
  const [range, setRange] = useState<RangeKey>("MAX");

  const metricsQ = useQuery({ queryKey: ["metrics"], queryFn: getMetrics });
  const perfQ = useQuery({ queryKey: ["performance", range], queryFn: () => getPerformance(range) });

  const summary = useMemo(() => {
    const points = perfQ.data?.points ?? [];
    if (points.length < 2) return null;
    const first = points[0];
    const last = points[points.length - 1];
    const portRet = (last.portfolio / first.portfolio - 1) * 100;
    const benchRet = (last.benchmark / first.benchmark - 1) * 100;
    return { portRet, benchRet };
  }, [perfQ.data]);

  return (
    <div className="space-y-10">
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Data-Driven Investment Strategy <span className="text-slate-500">with Proven Results</span>
          </h1>
          <p className="text-lg text-slate-600">
            Apex Capital combines quantitative analysis with fundamental research to deliver
            consistent, risk-adjusted returns that outperform market benchmarks.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/about"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Learn About Our Team →
            </Link>
            <Link
              to="/strategy"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              View Investment Strategy
            </Link>
          </div>
        </div>

        <Card className="p-6">
          <div className="text-sm font-medium text-slate-600">At a glance</div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MetricTile title="Total Return" value={metricsQ.data ? fmtPct(metricsQ.data.totalReturnPct) : "—"} subtitle={metricsQ.data?.since} />
            <MetricTile title="YTD Return" value={metricsQ.data ? fmtPct(metricsQ.data.ytdReturnPct) : "—"} subtitle="2026" />
            <MetricTile title="Sharpe Ratio" value={metricsQ.data ? metricsQ.data.sharpe.toFixed(2) : "—"} subtitle="Risk-adjusted" />
            <MetricTile title="Assets Under Management" value={metricsQ.data ? fmtUsd(metricsQ.data.aumUsd) : "—"} subtitle="Current AUM" />
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Portfolio Performance</h2>
            <p className="text-slate-600">
              Comparing our fund’s performance against the {metricsQ.data?.benchmarkName ?? "S&P 500"} benchmark.
            </p>
          </div>
          <RangeSelector value={range} onChange={setRange} />
        </div>

        <Card className="p-6">
          {perfQ.isLoading ? (
            <div className="h-[340px] animate-pulse rounded-xl bg-slate-100" />
          ) : perfQ.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              Failed to load performance data.
            </div>
          ) : (
            <>
              <PerformanceChart data={perfQ.data!.points} />
              <div className="mt-4 text-sm text-slate-600">
                {summary ? (
                  <p>
                    Over the selected period, the portfolio returned{" "}
                    <span className="font-semibold text-slate-900">{fmtPct(summary.portRet)}</span>{" "}
                    vs benchmark{" "}
                    <span className="font-semibold text-slate-900">{fmtPct(summary.benchRet)}</span>.
                  </p>
                ) : (
                  <p>Performance summary will appear once data is available.</p>
                )}
              </div>
            </>
          )}
        </Card>
      </section>
    </div>
  );
}
