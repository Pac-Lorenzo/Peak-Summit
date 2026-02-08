export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-600">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Apex Capital LLC</div>
          <div className="text-slate-500">
            Educational / showcase site. Not investment advice.
          </div>
        </div>
      </div>
    </footer>
  );
}
