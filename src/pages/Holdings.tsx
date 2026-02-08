import { useQuery } from "@tanstack/react-query";
import { getHoldings } from "../api/queries";
import { Card } from "../components/Card";

export function Holdings() {
  const q = useQuery({ queryKey: ["holdings"], queryFn: getHoldings });

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Portfolio Holdings</h1>
        <p className="text-lg text-slate-600">
          Current positions and allocation (weights).
        </p>
      </header>

      <Card className="p-6">
        {q.isLoading ? (
          <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
        ) : q.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Failed to load holdings.
          </div>
        ) : (
          <>
            <div className="text-sm text-slate-600">As of {q.data!.asOf}</div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-600">
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-4 font-semibold">Ticker</th>
                    <th className="py-2 pr-4 font-semibold">Name</th>
                    <th className="py-2 pr-4 font-semibold">Weight</th>
                    <th className="py-2 font-semibold">Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {q.data!.holdings.map((h) => (
                    <tr key={h.ticker} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-semibold text-slate-900">{h.ticker}</td>
                      <td className="py-3 pr-4 text-slate-700">{h.name}</td>
                      <td className="py-3 pr-4 text-slate-700">{(h.weight * 100).toFixed(1)}%</td>
                      <td className="py-3">
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${Math.max(0, Math.min(100, h.weight * 100))}%` }}
                            aria-label={`${h.ticker} allocation ${(h.weight * 100).toFixed(1)}%`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
