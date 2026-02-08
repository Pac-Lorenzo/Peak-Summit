import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/strategy", label: "Strategy" },
  { to: "/holdings", label: "Holdings" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur",
        "transition-all duration-500",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow"
      >
        Skip to content
      </a>

      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white font-bold">
              P
            </div>
            <div className="text-base font-semibold tracking-tight text-slate-900">
              Peak Summit Capital
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "rounded-lg px-3 py-2 text-sm font-medium transition",
                    "focus-visible:ring-2 focus-visible:ring-blue-500",
                    isActive ? "text-blue-600" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        {/* Mobile nav panel */}
        <div
          id="mobile-nav"
          className={clsx(
            "md:hidden overflow-hidden transition-all duration-300",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="mt-3 grid gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "rounded-xl px-3 py-2 text-sm font-medium transition",
                    "focus-visible:ring-2 focus-visible:ring-blue-500",
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
