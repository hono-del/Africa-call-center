import Link from "next/link";

export function StatCard({
  label,
  value,
  sub,
  compare,
  filtered = false,
  href
}: {
  label: string;
  value: string;
  sub?: string;
  /** Full-dataset value shown as comparison when a filter is active */
  compare?: string;
  /** When true, renders an amber top-border and a subtle tint */
  filtered?: boolean;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${filtered ? "text-brand-700" : "text-slate-900"}`}>
        {value}
      </p>
      {filtered && compare && (
        <p className="mt-0.5 text-[11px] text-slate-400">
          全体 <span className="font-medium text-slate-500">{compare}</span>
        </p>
      )}
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </>
  );

  const baseClass = filtered
    ? "rounded-xl border border-brand-200 bg-brand-50 p-4 shadow-sm border-t-2 border-t-brand-500"
    : "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";

  if (href) {
    return (
      <Link
        href={href}
        className={`block transition hover:border-brand-300 hover:shadow-md ${baseClass}`}
      >
        {inner}
        <p className="mt-2 text-[11px] font-medium text-brand-600">詳細を見る →</p>
      </Link>
    );
  }

  return <div className={baseClass}>{inner}</div>;
}
