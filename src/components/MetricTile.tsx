import { Card } from "./Card";

export function MetricTile({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <Card className="p-5">
      <div className="text-sm text-slate-600">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
      {subtitle ? <div className="mt-2 text-sm text-slate-600">{subtitle}</div> : null}
    </Card>
  );
}
