"use client";

// Manager Dashboard
// All KPIs, charts, and the recent table react to the same filter state.
// Cross-filtering: each chart is filtered by the OTHER two dimensions so you can
// see e.g. "for engine inquiries, what is the voice/text split and resolution breakdown?".

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { INQUIRY_LOGS } from "@/data/inquiryLogs";
import type { InquiryLog } from "@/data/types";
import { CATEGORIES, categoryLabel } from "@/data/categoryMaster";
import { COUNTRIES } from "@/data/vehicleMaster";
import { useLang } from "@/lib/i18n";

// ─── helpers ─────────────────────────────────────────────────────────────────

function pct(n: number, d: number) {
  return d === 0 ? "–" : `${Math.round((n / d) * 100)}%`;
}

function pctNum(n: number, d: number): number {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

function applyFilters(
  logs: InquiryLog[],
  cat: string | null,
  chan: string | null,
  out: string | null
) {
  return logs
    .filter((l) => !cat  || l.inquiryCategory === cat)
    .filter((l) => !chan || l.channel === chan)
    .filter((l) => !out  || l.resolution.status === out);
}

function computeKpis(logs: InquiryLog[]) {
  const total     = logs.length;
  const resolved  = logs.filter((l) => l.resolution.status === "resolved").length;
  const escalated = logs.filter((l) => l.resolution.status === "escalated").length;
  const pending   = logs.filter((l) => l.resolution.status === "pending").length;
  const aiAdopted = logs.filter((l) =>
    l.searchLogs.some((s) => s.answerCandidates.some((c) => c.wasAdopted))
  ).length;
  const satArr = logs.map((l) => l.satisfactionScore).filter((s): s is number => s != null);
  const avgSat = satArr.length > 0
    ? (satArr.reduce((a, b) => a + b, 0) / satArr.length).toFixed(1)
    : "–";
  const timeArr = logs.map((l) => l.handlingTimeMins).filter((v): v is number => v != null);
  const avgTime = timeArr.length > 0
    ? Math.round(timeArr.reduce((a, b) => a + b, 0) / timeArr.length)
    : 0;
  const gaps = logs.filter(
    (l) =>
      l.resolution.status === "escalated" ||
      l.searchLogs.every((s) => s.answerCandidates.every((c) => !c.wasAdopted))
  ).length;
  const voice = logs.filter((l) => l.channel === "voice").length;
  const text  = logs.filter((l) => l.channel === "text").length;
  return { total, resolved, escalated, pending, aiAdopted, avgSat, avgTime, gaps,
           satCount: satArr.length, timeCount: timeArr.length, voice, text };
}

// ─── component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { lang, t } = useLang();
  const ja = lang === "ja";

  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterChannel,  setFilterChannel]  = useState<string | null>(null);
  const [filterOutcome,  setFilterOutcome]  = useState<string | null>(null);

  const anyFilter = filterCategory !== null || filterChannel !== null || filterOutcome !== null;

  function clearFilters() {
    setFilterCategory(null);
    setFilterChannel(null);
    setFilterOutcome(null);
  }
  const toggleCat  = (k: string) => setFilterCategory((p) => (p === k ? null : k));
  const toggleChan = (k: string) => setFilterChannel((p)  => (p === k ? null : k));
  const toggleOut  = (k: string) => setFilterOutcome((p)  => (p === k ? null : k));

  // ── labels ──────────────────────────────────────────────────────────────────
  const RESOLUTION_LABEL: Record<string, string> = {
    resolved: t("res_resolved"),
    escalated: t("res_escalated"),
    pending: t("res_pending")
  };
  const SALE_LABELS: Record<string, string> = {
    new: t("sale_new"),
    certified_used: t("sale_used"),
    grey_import: t("sale_grey")
  };

  // ── data subsets ─────────────────────────────────────────────────────────────
  const ALL = INQUIRY_LOGS;

  /** Fully filtered — drives KPIs and recent table */
  const filtered = useMemo(
    () => applyFilters(ALL, filterCategory, filterChannel, filterOutcome),
    [filterCategory, filterChannel, filterOutcome]
  );

  /** Cross-filtered subsets — each chart excludes its own dimension so
   *  the bars/splits reflect the OTHER active filters. */
  const forCatChart  = useMemo(() => applyFilters(ALL, null, filterChannel, filterOutcome), [filterChannel, filterOutcome]);
  const forChanSplit = useMemo(() => applyFilters(ALL, filterCategory, null, filterOutcome), [filterCategory, filterOutcome]);
  const forOutSplit  = useMemo(() => applyFilters(ALL, filterCategory, filterChannel, null), [filterCategory, filterChannel]);

  // KPIs
  const full = useMemo(() => computeKpis(ALL), []);
  const kpi  = useMemo(() => computeKpis(filtered), [filtered]);

  // Category chart rows
  const byCategory = useMemo(() =>
    CATEGORIES.map((c) => {
      const rows = forCatChart.filter((l) => l.inquiryCategory === c.key);
      const res  = rows.filter((l) => l.resolution.status === "resolved").length;
      return {
        key:      c.key,
        label:    ja ? c.labelJa : c.label,
        count:    rows.length,
        resRate:  rows.length === 0 ? null : Math.round((res / rows.length) * 100)
      };
    }).sort((a, b) => b.count - a.count),
  [forCatChart, ja]);

  const maxCat = Math.max(...byCategory.map((c) => c.count), 1);

  // Split-bar items (cross-filtered)
  const channelItems = useMemo(() => {
    const v = forChanSplit.filter((l) => l.channel === "voice").length;
    const tx = forChanSplit.filter((l) => l.channel === "text").length;
    return [
      { filterKey: "voice", label: t("voice_label"), value: v,  color: "bg-slate-500" },
      { filterKey: "text",  label: t("text_label"),  value: tx, color: "bg-sky-500"   }
    ];
  }, [forChanSplit, lang]);

  const outcomeItems = useMemo(() => {
    const r = forOutSplit.filter((l) => l.resolution.status === "resolved").length;
    const e = forOutSplit.filter((l) => l.resolution.status === "escalated").length;
    const p = forOutSplit.filter((l) => l.resolution.status === "pending").length;
    return [
      { filterKey: "resolved",  label: t("res_resolved"),  value: r, color: "bg-emerald-500" },
      { filterKey: "escalated", label: t("res_escalated"), value: e, color: "bg-rose-500"    },
      { filterKey: "pending",   label: t("res_pending"),   value: p, color: "bg-amber-500"   }
    ];
  }, [forOutSplit, lang]);

  const splitTotal = (items: { value: number }[]) => items.reduce((a, b) => a + b.value, 0);

  const greyImports = filtered.filter((l) => l.saleType === "grey_import").length;

  // Recent table (sorted, full when filtered)
  const recentRows = useMemo(
    () => [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [filtered]
  );

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{t("dash_title")}</h1>
          <p className="text-xs text-slate-500">{t("dash_sub")}</p>
        </div>
        {anyFilter && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-medium text-brand-700 ring-1 ring-brand-200 hover:bg-brand-100"
          >
            <span>✕</span>
            {ja ? "フィルターをすべて解除" : "Clear all filters"}
          </button>
        )}
      </div>

      {/* Filter chips row */}
      {anyFilter && (
        <div className="flex flex-wrap gap-2">
          {filterCategory && (
            <FilterChip
              label={`${ja ? "カテゴリ" : "Category"}: ${byCategory.find((c) => c.key === filterCategory)?.label ?? filterCategory}`}
              onRemove={() => setFilterCategory(null)}
            />
          )}
          {filterChannel && (
            <FilterChip
              label={`${ja ? "チャネル" : "Channel"}: ${channelItems.find((i) => i.filterKey === filterChannel)?.label ?? filterChannel}`}
              onRemove={() => setFilterChannel(null)}
            />
          )}
          {filterOutcome && (
            <FilterChip
              label={`${ja ? "解決状況" : "Outcome"}: ${outcomeItems.find((i) => i.filterKey === filterOutcome)?.label ?? filterOutcome}`}
              onRemove={() => setFilterOutcome(null)}
            />
          )}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatCard
          filtered={anyFilter}
          label={t("kpi_total")}
          value={String(kpi.total)}
          compare={anyFilter ? `${full.total}${ja ? "件" : ""}` : undefined}
          sub={`${t("voice_label")} ${kpi.voice} · Text ${kpi.text}`}
        />
        <StatCard
          filtered={anyFilter}
          label={t("kpi_resolution")}
          value={pct(kpi.resolved, kpi.total)}
          compare={anyFilter ? pct(full.resolved, full.total) : undefined}
          sub={`${kpi.resolved} ${t("res_resolved")}`}
        />
        <StatCard
          filtered={anyFilter}
          label={t("kpi_ai")}
          value={pct(kpi.aiAdopted, kpi.total)}
          compare={anyFilter ? pct(full.aiAdopted, full.total) : undefined}
          sub={t("kpi_ai_sub")}
        />
        <StatCard
          filtered={anyFilter}
          label={t("kpi_sat")}
          value={`${kpi.avgSat} / 5`}
          compare={anyFilter ? `${full.avgSat} / 5` : undefined}
          sub={`${kpi.satCount} ${t("kpi_sat_sub")}`}
        />
        <StatCard
          filtered={anyFilter}
          label={ja ? "平均対応時間" : "Avg. handling time"}
          value={`${kpi.avgTime} ${ja ? "分" : "min"}`}
          compare={anyFilter ? `${full.avgTime} ${ja ? "分" : "min"}` : undefined}
          sub={`${kpi.timeCount} ${ja ? "件の対応から算出" : "interactions"}`}
        />
        <StatCard
          filtered={anyFilter}
          label={t("kpi_gaps")}
          value={String(kpi.gaps)}
          compare={anyFilter ? `${full.gaps}${ja ? "件" : ""}` : undefined}
          sub={t("kpi_gaps_sub")}
          href="/dashboard/knowledge-gaps"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Category breakdown */}
        <Card title={t("by_category")} className="lg:col-span-2">
          <p className="mb-3 text-[11px] text-slate-400">
            {ja
              ? "棒をクリックしてフィルタリング ／ 右端の%は解決率"
              : "Click a bar to filter · right % = resolution rate"}
          </p>
          <ul className="space-y-2">
            {byCategory.map((c) => {
              const active = filterCategory === c.key;
              const dimmed = filterCategory !== null && !active;
              const resColor =
                c.resRate === null ? "text-slate-300"
                : c.resRate >= 70   ? "text-emerald-600"
                : c.resRate >= 40   ? "text-amber-600"
                :                     "text-rose-600";
              return (
                <li
                  key={c.key}
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-1 py-0.5 transition-opacity hover:bg-slate-50 ${dimmed ? "opacity-35" : ""}`}
                  onClick={() => toggleCat(c.key)}
                  title={active ? (ja ? "フィルター解除" : "Clear filter") : (ja ? "このカテゴリでフィルター" : "Filter by this category")}
                >
                  <span className="w-48 shrink-0 truncate text-xs text-slate-600">{c.label}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded bg-slate-100">
                    <div
                      className={`h-full rounded transition-colors ${active ? "bg-brand-600" : "bg-brand-500"}`}
                      style={{ width: `${(c.count / maxCat) * 100}%` }}
                    />
                  </div>
                  <span className={`w-6 shrink-0 text-right text-xs font-medium ${active ? "text-brand-700" : "text-slate-700"}`}>
                    {c.count}
                  </span>
                  {/* Resolution rate badge */}
                  <span className={`w-12 shrink-0 text-right text-[11px] font-semibold ${resColor}`}>
                    {c.resRate !== null ? `${c.resRate}%` : "–"}
                  </span>
                  {active && (
                    <span className="shrink-0 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                      {ja ? "選択中" : "ON"}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          {/* Legend for resolution rate color */}
          <div className="mt-3 flex gap-4 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
            <span><span className="font-semibold text-emerald-600">■</span> {ja ? "解決率 70%以上" : "≥70% resolved"}</span>
            <span><span className="font-semibold text-amber-600">■</span> {ja ? "40–69%" : "40–69%"}</span>
            <span><span className="font-semibold text-rose-600">■</span> {ja ? "39%以下" : "≤39%"}</span>
          </div>
        </Card>

        {/* Splits */}
        <div className="space-y-4">
          <Card title={t("channel_split")}>
            <p className="mb-2 text-[11px] text-slate-400">
              {ja ? "項目をクリックしてフィルタリング" : "Click an item to filter"}
            </p>
            <SplitBar
              items={channelItems}
              total={splitTotal(channelItems)}
              selected={filterChannel}
              onSelect={toggleChan}
            />
          </Card>
          <Card title={t("outcome_split")}>
            <p className="mb-2 text-[11px] text-slate-400">
              {ja ? "項目をクリックしてフィルタリング" : "Click an item to filter"}
            </p>
            <SplitBar
              items={outcomeItems}
              total={splitTotal(outcomeItems)}
              selected={filterOutcome}
              onSelect={toggleOut}
            />
            <p className="mt-2 text-[11px] text-slate-400">
              {greyImports} {t("grey_note_1")} {kpi.total} ({pct(greyImports, kpi.total)}) {t("grey_note_2")}
            </p>
          </Card>
        </div>
      </div>

      {/* Recent interactions */}
      <Card
        title={
          anyFilter
            ? `${t("recent")} — ${ja ? "フィルター適用中" : "Filtered"} (${recentRows.length} ${ja ? "件" : "results"})`
            : t("recent")
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400">
                <th className="py-2 pr-3 font-medium">{t("th_date")}</th>
                <th className="py-2 pr-3 font-medium">{t("th_country")}</th>
                <th className="py-2 pr-3 font-medium">{t("th_vehicle")}</th>
                <th className="py-2 pr-3 font-medium">{t("th_sale")}</th>
                <th className="py-2 pr-3 font-medium">{t("th_category")}</th>
                <th className="py-2 pr-3 font-medium">{t("th_channel")}</th>
                <th className="py-2 pr-3 font-medium">{t("th_agent")}</th>
                <th className="py-2 font-medium">{t("th_outcome")}</th>
              </tr>
            </thead>
            <tbody>
              {(anyFilter ? recentRows : recentRows.slice(0, 10)).map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-3 text-slate-500">
                    {new Date(l.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="py-2 pr-3">
                    {COUNTRIES.find((c) => c.code === l.country)?.name ?? l.country}
                  </td>
                  <td className="py-2 pr-3 font-medium text-slate-700">
                    {l.vehicleBrand} {l.vehicleModel}
                  </td>
                  <td className="py-2 pr-3 text-slate-500">{SALE_LABELS[l.saleType]}</td>
                  <td className="py-2 pr-3 text-slate-600">{categoryLabel(l.inquiryCategory, lang)}</td>
                  <td className="py-2 pr-3">
                    <Badge kind={l.channel}>{l.channel === "voice" ? t("voice_label") : "Text"}</Badge>
                  </td>
                  <td className="py-2 pr-3 text-slate-500">{l.operatorName}</td>
                  <td className="py-2">
                    <Badge kind={l.resolution.status}>{RESOLUTION_LABEL[l.resolution.status]}</Badge>
                  </td>
                </tr>
              ))}
              {recentRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-xs text-slate-400">
                    {ja ? "該当する問合せがありません" : "No matching inquiries"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!anyFilter && recentRows.length > 10 && (
          <p className="mt-2 text-[11px] text-slate-400">
            {ja
              ? `直近10件を表示中（全 ${recentRows.length} 件）。フィルターを適用すると全件表示されます。`
              : `Showing 10 of ${recentRows.length}. Apply a filter to see all matching rows.`}
          </p>
        )}
      </Card>
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function SplitBar({
  items,
  total,
  selected,
  onSelect
}: {
  items: { filterKey: string; label: string; value: number; color: string }[];
  total: number;
  selected?: string | null;
  onSelect?: (key: string) => void;
}) {
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded bg-slate-100">
        {items.map((i) => (
          <div
            key={i.filterKey}
            className={`${i.color} cursor-pointer transition-opacity ${selected && selected !== i.filterKey ? "opacity-30" : ""}`}
            style={{ width: total === 0 ? 0 : `${(i.value / total) * 100}%` }}
            onClick={() => onSelect?.(i.filterKey)}
            title={i.label}
          />
        ))}
      </div>
      <ul className="mt-2 space-y-1">
        {items.map((i) => {
          const active = selected === i.filterKey;
          const dimmed = selected != null && !active;
          return (
            <li
              key={i.filterKey}
              className={`flex cursor-pointer items-center justify-between rounded px-1 py-0.5 text-xs text-slate-600 hover:bg-slate-50 ${dimmed ? "opacity-40" : ""}`}
              onClick={() => onSelect?.(i.filterKey)}
            >
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${i.color} ${active ? "ring-2 ring-offset-1 ring-slate-400" : ""}`} />
                <span className={active ? "font-semibold text-slate-800" : ""}>{i.label}</span>
                {active && (
                  <span className="rounded bg-slate-200 px-1 py-px text-[9px] font-bold uppercase text-slate-500">ON</span>
                )}
              </span>
              <span className="font-medium">
                {i.value} ({total === 0 ? 0 : Math.round((i.value / total) * 100)}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700 ring-1 ring-brand-200">
      {label}
      <button onClick={onRemove} className="ml-0.5 text-brand-400 hover:text-brand-700" aria-label="Remove filter">×</button>
    </span>
  );
}
