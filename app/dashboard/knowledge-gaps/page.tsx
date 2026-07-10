"use client";

// Knowledge-gap detail page.
// Shows each gap case: inquiry topic, missing information, result, improvement suggestion.

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { INQUIRY_LOGS } from "@/data/inquiryLogs";
import { GAP_DETAILS } from "@/data/knowledgeGaps";
import { COUNTRIES } from "@/data/vehicleMaster";
import { useLang } from "@/lib/i18n";

export default function KnowledgeGapsPage() {
  const { lang, t } = useLang();
  const ja = lang === "ja";

  const logs = INQUIRY_LOGS;

  // Collect gap logs: escalated OR no AI candidate adopted
  const gapLogs = logs.filter(
    (l) =>
      l.resolution.status === "escalated" ||
      l.searchLogs.every((s) => s.answerCandidates.every((c) => !c.wasAdopted))
  );

  const RESOLUTION_LABEL: Record<string, string> = {
    resolved: t("res_resolved"),
    escalated: t("res_escalated"),
    pending: t("res_pending"),
    pending_customer: t("res_pending_customer"),
    pending_no_answer: t("res_pending_no_answer")
  };

  const COL_HEADERS = ja
    ? ["問合せ内容", "何の情報が不足していたか", "結果", "改善提案"]
    : ["Inquiry topic", "Missing information", "Result", "Improvement suggestion"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-xs font-medium text-brand-600 hover:underline">
          ← {ja ? "ダッシュボードへ戻る" : "Back to dashboard"}
        </Link>
        <span className="text-slate-300">|</span>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {ja ? "ナレッジギャップ一覧" : "Knowledge Gaps"}
          </h1>
          <p className="text-xs text-slate-500">
            {ja
              ? "回答できなかった・エスカレーションした問い合わせ一覧。ナレッジ改善の優先付けに活用してください。"
              : "Inquiries that could not be answered or required escalation — use to prioritise knowledge improvements."}
          </p>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <span className="text-2xl font-semibold text-amber-700">{gapLogs.length}</span>
        <div className="text-xs text-amber-800">
          <p className="font-medium">
            {ja ? "件のナレッジギャップ" : "knowledge gaps detected"}
          </p>
          <p className="text-amber-600">
            {ja ? `うち詳細情報あり：${GAP_DETAILS.length} 件` : `${GAP_DETAILS.length} with detailed analysis`}
          </p>
        </div>
      </div>

      {/* Column header row */}
      <div className="hidden grid-cols-4 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-slate-50 md:grid">
        {COL_HEADERS.map((h) => (
          <div key={h} className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {h}
          </div>
        ))}
      </div>

      {/* Gap cards */}
      <div className="space-y-3">
        {gapLogs.map((log) => {
          const detail = GAP_DETAILS.find((g) => g.inquiryId === log.id);
          const country = COUNTRIES.find((c) => c.code === log.country);
          const dateLocale = ja ? "ja-JP" : "en-GB";
          const date = new Date(log.createdAt).toLocaleDateString(dateLocale, {
            year: "numeric", month: "2-digit", day: "2-digit"
          });

          const topicText    = detail ? (ja ? detail.topic      : detail.topicEn)      : log.rawInquiryText;
          const infoGapText  = detail ? (ja ? detail.infoGap    : detail.infoGapEn)    : null;
          const resultText   = detail ? (ja ? detail.result     : detail.resultEn)     : null;
          const suggText     = detail ? (ja ? detail.suggestion : detail.suggestionEn) : null;

          return (
            <Card key={log.id} className="!p-0 overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{date}</span>
                  <span>·</span>
                  <span>{log.vehicleBrand} {log.vehicleModel}</span>
                  <span>·</span>
                  <span>{country?.name ?? log.country}</span>
                  <span>·</span>
                  <span>{log.operatorName}</span>
                </div>
                <Badge kind={log.resolution.status}>
                  {RESOLUTION_LABEL[log.resolution.status] ?? log.resolution.status}
                </Badge>
              </div>

              {/* Card body — 4-column grid */}
              <div className="grid gap-0 divide-x divide-slate-100 md:grid-cols-4">
                {/* 1. Inquiry topic */}
                <div className="p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                    {COL_HEADERS[0]}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-700">{topicText}</p>
                </div>

                {/* 2. Missing information */}
                <div className="p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                    {COL_HEADERS[1]}
                  </p>
                  {infoGapText ? (
                    <p className="text-xs leading-relaxed text-rose-700">{infoGapText}</p>
                  ) : (
                    <p className="text-xs italic text-slate-400">{ja ? "未分析" : "Not analysed"}</p>
                  )}
                </div>

                {/* 3. Result */}
                <div className="p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                    {COL_HEADERS[2]}
                  </p>
                  {resultText ? (
                    <p className="text-xs leading-relaxed text-slate-700">{resultText}</p>
                  ) : (
                    <div className="space-y-1">
                      <Badge kind={log.resolution.status}>
                        {RESOLUTION_LABEL[log.resolution.status] ?? log.resolution.status}
                      </Badge>
                      {log.resolution.note && (
                        <p className="text-xs text-slate-500">{log.resolution.note}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Improvement suggestion */}
                <div className="p-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                    {COL_HEADERS[3]}
                  </p>
                  {suggText ? (
                    <p className="text-xs leading-relaxed text-emerald-700">{suggText}</p>
                  ) : (
                    <p className="text-xs italic text-slate-400">{ja ? "未入力" : "Not specified"}</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
