import { clsx } from "clsx";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={clsx(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        props.className
      )}
    />
  );
}
