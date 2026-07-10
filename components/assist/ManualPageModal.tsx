"use client";

// Modal viewer showing the actual Owner's Manual page (text view).
// Page numbers match the printed/PDF manual so stakeholders can cross-check
// the AI's answer against the source.

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

export default function ManualPageModal({
  page,
  onClose
}: {
  page: number | null;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [current, setCurrent] = useState<number>(page ?? 1);
  const [text, setText] = useState<string>("");
  const [total, setTotal] = useState<number>(468);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (page != null) setCurrent(page);
  }, [page]);

  useEffect(() => {
    if (page == null) return;
    setLoading(true);
    fetch(`/api/manual-page?p=${current}`)
      .then((r) => r.json())
      .then((d) => {
        setText(d.text ?? "");
        setTotal(d.total ?? 468);
      })
      .catch(() => setText(""))
      .finally(() => setLoading(false));
  }, [current, page]);

  if (page == null) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
          <h3 className="text-sm font-semibold text-slate-800">
            {t("manual_page")} {current} <span className="text-slate-400">/ {total}</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrent((c) => Math.max(1, c - 1))}
              disabled={current <= 1}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              {t("prev_page")}
            </button>
            <button
              onClick={() => setCurrent((c) => Math.min(total, c + 1))}
              disabled={current >= total}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              {t("next_page")}
            </button>
            <button
              onClick={onClose}
              className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700"
            >
              {t("close")}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              Loading…
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-slate-800">
              {text || "—"}
            </pre>
          )}
        </div>
        <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
          {t("page_text_note")}
        </p>
      </div>
    </div>
  );
}
