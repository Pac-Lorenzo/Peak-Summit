import { clsx } from "clsx";
import type { RangeKey } from "../api/queries";

const ranges: RangeKey[] = ["1M", "3M", "1Y", "MAX"];

export function RangeSelector({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (v: RangeKey) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
      {ranges.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={clsx(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-blue-500",
            value === r ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
          )}
          aria-pressed={value === r}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
