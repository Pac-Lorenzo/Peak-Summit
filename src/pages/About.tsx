import { Card } from "../components/Card";

export function About() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Meet the Team</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Apex Capital was founded by two partners with complementary expertise in quantitative finance and technology investing.
        </p>
      </header>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
          <div className="h-52 w-52 rounded-2xl bg-slate-100" aria-hidden="true" />
          <div className="space-y-2">
            <div className="text-2xl font-semibold">Robbie Berven</div>
            <div className="text-sm font-semibold text-blue-600">Co-Founder & Portfolio Manager</div>
            <p className="text-slate-600">
              Replace this bio with your real background. Keep it crisp, credentialed, and relevant to strategy + execution.
            </p>
            <div className="flex gap-3 pt-2">
              <a className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500" href="#">
                LinkedIn
              </a>
              <a className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500" href="#">
                Email
              </a>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-[1fr_220px] md:items-start">
          <div className="space-y-2">
            <div className="text-2xl font-semibold">Paco Lorenzo</div>
            <div className="text-sm font-semibold text-blue-600">Co-Founder & Portfolio Manager</div>
            <p className="text-slate-600">
              Replace this bio with your real background. Keep it crisp, credentialed, and relevant to strategy + execution.
            </p>
            <div className="flex gap-3 pt-2">
              <a className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500" href="#">
                LinkedIn
              </a>
              <a className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500" href="#">
                Email
              </a>
            </div>
          </div>
          <div className="h-52 w-52 rounded-2xl bg-slate-100" aria-hidden="true" />
        </div>
      </Card>
      
    </div>
  );
}
