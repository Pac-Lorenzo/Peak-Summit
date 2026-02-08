import { Card } from "../components/Card";

export function Strategy() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Investment Strategy</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Explain your philosophy, process, and risk management clearly. This is the “why we exist” page.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Thesis-Driven", body: "We combine fundamental conviction with quantitative validation." },
          { title: "Risk-Managed", body: "Position sizing and diversification are first-class constraints." },
          { title: "Repeatable", body: "Rules and review cadence designed for consistency across market regimes." },
        ].map((x) => (
          <Card key={x.title} className="p-6">
            <div className="text-lg font-semibold">{x.title}</div>
            <p className="mt-2 text-slate-600">{x.body}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold">Process</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-600">
          <li>Screen and prioritize ideas (quality, growth, valuation, catalysts).</li>
          <li>Underwrite thesis (what must be true, what breaks it).</li>
          <li>Size positions and set risk constraints.</li>
          <li>Monitor + rebalance on a defined cadence.</li>
        </ol>
      </Card>
    </div>
  );
}
