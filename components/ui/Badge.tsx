const STYLES: Record<string, string> = {
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  escalated: "bg-rose-50 text-rose-700 border-rose-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  voice: "bg-slate-100 text-slate-700 border-slate-200",
  text: "bg-sky-50 text-sky-700 border-sky-200",
  high: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  manual: "bg-blue-50 text-blue-700 border-blue-200",
  faq: "bg-orange-50 text-orange-700 border-orange-200"
};

export function Badge({ kind = "neutral", children }: { kind?: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        STYLES[kind] ?? STYLES.neutral
      }`}
    >
      {children}
    </span>
  );
}
