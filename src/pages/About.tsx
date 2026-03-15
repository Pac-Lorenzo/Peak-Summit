import { Card } from "../components/Card";

export function About() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Meet the Team</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Peak Summit Capital was founded by two partners with complementary expertise in quantitative finance and technology investing.
        </p>
      </header>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
          <img
            className="h-52 w-52 rounded-2xl object-cover"
            src="/profile-pics/robbie-profile.jpeg"
            alt="Robbie Berven"
            loading="lazy"
          />
          <div className="space-y-2">
            <div className="text-2xl font-semibold">Robbie Berven</div>
            <div className="text-sm font-semibold text-blue-600">Co-Founder & Portfolio Manager</div>
            <p className="text-slate-600">
              Finance professional and investor with experience in private wealth management, equity research, and alternative investments. With a foundation in corporate finance and hands-on work across pre-IPO markets and portfolio construction.
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
            <div className="text-sm font-semibold text-blue-600">Co-Founder & CTO</div>
            <p className="text-slate-600">
              Software developer and investor with over five years of experience investing in technology-sector stocks. With a background in computer engineering, I apply data-driven systems thinking to both software development and capital allocation.
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
          <img
            className="h-52 w-52 rounded-2xl object-cover"
            src="/profile-pics/paco-profile1.jpg"
            alt="Paco Lorenzo"
            loading="lazy"
          />
        </div>
      </Card>
      
    </div>
  );
}
