import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { fmtDate } from "../lib/format";
import type { PerformancePoint } from "../api/queries";

function TooltipContent({
  active,
  payload,
  label,
}: any) {
  if (!active || !payload?.length) return null;
  const p = payload.find((x: any) => x.dataKey === "portfolio")?.value;
  const b = payload.find((x: any) => x.dataKey === "benchmark")?.value;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-sm font-medium text-slate-900">{fmtDate(label)}</div>
      <div className="mt-2 text-sm text-slate-700">
        Portfolio: <span className="font-semibold text-slate-900">{p?.toFixed(1)}</span>
      </div>
      <div className="text-sm text-slate-700">
        Benchmark: <span className="font-semibold text-slate-900">{b?.toFixed(1)}</span>
      </div>
    </div>
  );
}

export function PerformanceChart({
  data,
}: {
  data: PerformancePoint[];
}) {
  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<TooltipContent />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="portfolio"
            strokeWidth={2}
            dot={false}
            name="Portfolio"
          />
          <Line
            type="monotone"
            dataKey="benchmark"
            strokeWidth={2}
            dot={false}
            name="S&P 500"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
