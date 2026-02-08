import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
