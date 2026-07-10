"use client";

// Agent Assist — the Phase 1 core screen.
// Step 1 uses a LINE/Messenger-style chat thread so operators can send
// multiple search queries in sequence (e.g. "エンジンがかからない" then
// "スターターが回らない") and see the history inline.  Each message stores
// its own search results; clicking a bubble switches the results panel.

import { useMemo, useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VEHICLES, COUNTRIES } from "@/data/vehicleMaster";
import { CATEGORIES } from "@/data/categoryMaster";
import { findScenario } from "@/data/assistScenarios";
import { jaContent } from "@/data/scenarioTranslations";
import { useLang } from "@/lib/i18n";
import type { AssistScenario, ResolutionStatus, Channel, SaleType } from "@/data/types";

type Phase = "input" | "results" | "saved";

type ManualHit = { id: string; section: string; page: number; snippet: string };

type ChatMessage = {
  id: string;
  text: string;
  scenario: AssistScenario | null;
  manualHits: ManualHit[];
  searching: boolean;
};

function firstSentence(text: string): string {
  const m = text.match(/^.*?(?:[。．]|\.\s)/);
  return m ? m[0].trim() : text.slice(0, 90) + (text.length > 90 ? "…" : "");
}

export default function AssistPage() {
  const { lang, t } = useLang();

  // Intake
  const [channel, setChannel] = useState<Channel>("text");
  const [country, setCountry] = useState("CI");
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [saleType, setSaleType] = useState<SaleType>("grey_import");
  const [category, setCategory] = useState(CATEGORIES[0].key);

  // AI auto-classification state
  type ClassifyState = "idle" | "classifying" | "classified";
  const [classifyState, setClassifyState] = useState<ClassifyState>("idle");
  const [classifyConfidence, setClassifyConfidence] = useState<"high" | "medium" | "low" | null>(null);
  const [classifyMatched, setClassifyMatched] = useState<string[]>([]);
  // Track whether operator has manually overridden the AI suggestion
  const [categoryManuallySet, setCategoryManuallySet] = useState(false);

  // Chat thread
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Phase & workflow
  const [phase, setPhase] = useState<Phase>("input");
  const [viewPage, setViewPage] = useState<number | null>(null);

  // Recording (global per case, not per message)
  const [adopted, setAdopted] = useState<Set<string>>(new Set());
  const [cqAnswers, setCqAnswers] = useState<Record<string, string>>({});
  const [actionsTaken, setActionsTaken] = useState<Set<string>>(new Set());
  const [resolution, setResolution] = useState<ResolutionStatus | "">("");
  const [note, setNote] = useState("");
  const [infoGapNote, setInfoGapNote] = useState("");

  // Derived — the currently visible results come from the active message
  const activeMsg = chatMessages[activeIdx] ?? null;
  const scenario = activeMsg?.scenario ?? null;
  const manualHits = activeMsg?.manualHits ?? [];
  const isSearching = activeMsg?.searching ?? false;

  const canSend = inputText.trim().length > 0;
  const canComplete = resolution !== "";

  // Auto-scroll thread to bottom when a new message is added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const SALE_LABELS: Record<SaleType, string> = {
    new: t("sale_new"),
    certified_used: t("sale_used"),
    grey_import: t("sale_grey")
  };
  const CONF: Record<string, string> = {
    high: t("conf_high"),
    medium: t("conf_medium"),
    low: t("conf_low")
  };
  const RES_OPTS: { value: ResolutionStatus; label: string; hint: string }[] = [
    { value: "resolved",          label: t("res_resolved"),             hint: t("res_resolved_hint") },
    { value: "escalated",         label: t("res_escalated"),            hint: t("res_escalated_hint") },
    { value: "pending_customer",  label: t("res_pending_customer"),     hint: t("res_pending_customer_hint") },
    { value: "pending_no_answer", label: t("res_pending_no_answer"),    hint: t("res_pending_no_answer_hint") }
  ];

  const sendMessage = () => {
    if (!canSend || phase === "saved") return;
    const text = inputText.trim();
    const msgId = `msg_${Date.now()}`;
    const newMsg: ChatMessage = { id: msgId, text, scenario: null, manualHits: [], searching: true };

    setChatMessages((prev) => {
      const next = [...prev, newMsg];
      setActiveIdx(next.length - 1);
      return next;
    });
    setInputText("");
    setViewPage(null);
    if (phase === "input") setPhase("results");

    fetch("/api/manual-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: text })
    })
      .then((r) => r.json())
      .then((d) => {
        setChatMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, manualHits: d.results ?? [] } : m))
        );
      })
      .catch(() => {});

    // AI category classification — run on first message, or if not manually overridden
    if (!categoryManuallySet) {
      setClassifyState("classifying");
      fetch("/api/classify-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text })
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.result) {
            setCategory(d.result.categoryKey);
            setClassifyConfidence(d.result.confidence);
            setClassifyMatched(d.result.matchedKeywords ?? []);
            setClassifyState("classified");
          } else {
            setClassifyState("idle");
          }
        })
        .catch(() => setClassifyState("idle"));
    }

    setTimeout(() => {
      const found = findScenario(text);
      setChatMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, scenario: found, searching: false } : m))
      );
    }, 900);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetCase = () => {
    setChatMessages([]);
    setActiveIdx(0);
    setInputText("");
    setPhase("input");
    setViewPage(null);
    setAdopted(new Set());
    setCqAnswers({});
    setActionsTaken(new Set());
    setResolution("");
    setNote("");
    setInfoGapNote("");
    setClassifyState("idle");
    setClassifyConfidence(null);
    setClassifyMatched([]);
    setCategoryManuallySet(false);
    setCategory(CATEGORIES[0].key);
  };

  const toggle = (set: Set<string>, id: string, apply: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    apply(next);
  };

  const savedSummary = useMemo(() => {
    if (!scenario) return null;
    return { adoptedCount: adopted.size, candidateCount: scenario.answerCandidates.length };
  }, [scenario, adopted]);

  const vehicle = VEHICLES[vehicleIdx];
  const countryEntry = COUNTRIES.find((c) => c.code === country)!;

  const selectCls = "w-full rounded-md border border-slate-300 px-2 py-1 text-xs";
  const labelCls = "mb-0.5 block text-[10px] font-medium text-slate-500";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">{t("assist_title")}</h1>
          <p className="text-[11px] text-slate-500">{t("assist_sub")}</p>
        </div>
        {phase !== "input" && (
          <button
            onClick={resetCase}
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            {t("new_inquiry")}
          </button>
        )}
      </div>

      {/* Step 1: Intake + chat-style question thread */}
      <Card title={t("step1")} className="!p-3">
        {/* Intake dropdowns */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <label>
            <span className={labelCls}>{t("channel")}</span>
            <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)} className={selectCls} disabled={phase === "saved"}>
              <option value="text">{t("ch_text")}</option>
              <option value="voice">{t("ch_voice")}</option>
            </select>
          </label>
          <label>
            <span className={labelCls}>{t("country")}</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectCls} disabled={phase === "saved"}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name} ({c.language.toUpperCase()})</option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelCls}>{t("vehicle")}</span>
            <select value={vehicleIdx} onChange={(e) => setVehicleIdx(Number(e.target.value))} className={selectCls} disabled={phase === "saved"}>
              {VEHICLES.map((v, i) => (
                <option key={`${v.brand}-${v.model}`} value={i}>{v.brand} {v.model}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelCls}>{t("sale_type")}</span>
            <select value={saleType} onChange={(e) => setSaleType(e.target.value as SaleType)} className={selectCls} disabled={phase === "saved"}>
              {(Object.keys(SALE_LABELS) as SaleType[]).map((k) => (
                <option key={k} value={k}>{SALE_LABELS[k]}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={`${labelCls} flex items-center gap-1.5`}>
              {t("category")}
              {/* AI classification status badge */}
              {classifyState === "classifying" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-px text-[9px] font-medium text-slate-500">
                  <span className="h-1.5 w-1.5 animate-spin rounded-full border border-slate-400 border-t-transparent" />
                  AI分類中
                </span>
              )}
              {classifyState === "classified" && !categoryManuallySet && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[9px] font-semibold ${
                    classifyConfidence === "high"
                      ? "bg-emerald-100 text-emerald-700"
                      : classifyConfidence === "medium"
                      ? "bg-brand-100 text-brand-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                  title={`マッチキーワード: ${classifyMatched.join(", ")}`}
                >
                  ✦ AI分類
                  {classifyConfidence === "high" && " (高確度)"}
                  {classifyConfidence === "medium" && " (中確度)"}
                  {classifyConfidence === "low" && " (低確度)"}
                </span>
              )}
              {categoryManuallySet && classifyState === "classified" && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-px text-[9px] text-slate-400">
                  手動設定
                </span>
              )}
            </span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCategoryManuallySet(true);
              }}
              className={`${selectCls} ${
                classifyState === "classified" && !categoryManuallySet
                  ? "border-brand-400 bg-brand-50 font-medium text-brand-800"
                  : ""
              }`}
              disabled={phase === "saved"}
            >
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{lang === "ja" ? c.labelJa : c.label}</option>
              ))}
            </select>
            {classifyState === "classified" && !categoryManuallySet && classifyMatched.length > 0 && (
              <p className="mt-0.5 text-[9px] text-brand-500">
                「{classifyMatched.join("」「")}」を検出
              </p>
            )}
          </label>
        </div>

        {/* Chat thread */}
        {chatMessages.length > 0 && (
          <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 space-y-2">
            {chatMessages.map((msg, idx) => (
              <div key={msg.id} className="flex justify-end">
                <button
                  onClick={() => { setActiveIdx(idx); setViewPage(null); }}
                  className={`max-w-[85%] rounded-2xl rounded-tr-sm px-3 py-2 text-left text-sm transition-all ${
                    idx === activeIdx
                      ? "bg-brand-600 text-white shadow-sm"
                      : "bg-brand-100 text-brand-900 hover:bg-brand-200"
                  }`}
                >
                  <p className="leading-snug">{msg.text}</p>
                  <p className={`mt-0.5 text-[10px] ${idx === activeIdx ? "text-brand-100" : "text-brand-400"}`}>
                    {msg.searching ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 animate-spin rounded-full border border-current border-t-transparent" />
                        検索中...
                      </span>
                    ) : "検索済 ✓"}
                  </p>
                </button>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Input area */}
        <div className="mt-2 flex gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={chatMessages.length === 0 ? t("q_placeholder") : "追加の症状・状況を入力（Enterで送信）"}
            rows={2}
            className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            disabled={phase === "saved"}
          />
          <button
            onClick={sendMessage}
            disabled={!canSend || phase === "saved"}
            className="shrink-0 self-stretch rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {lang === "ja" ? "送信 / 検索" : t("search_btn")}
          </button>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">
          {chatMessages.length === 0 ? t("q_note") : "Shift+Enterで改行、Enterで送信"}
        </p>
      </Card>

      {/* Results — shown once at least one message has results */}
      {(phase === "results" || phase === "saved") && (
        <div className="space-y-3">
          {/* Top row: Answer candidates + Manual excerpts side by side */}
          <div className="grid gap-3 lg:grid-cols-2">
            {/* Left: Answer candidates */}
            <Card title={`${t("step_candidates")} — ${t("candidates_hint")}`} className="!p-3">
              {isSearching ? (
                <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                  {t("searching_msg")}
                </div>
              ) : scenario ? (
                <ul className="space-y-2">
                  {scenario.answerCandidates.map((c) => {
                    const isAdopted = adopted.has(c.id);
                    const full = jaContent(c.id, c.answerText, lang);
                    const srcMaterial = scenario.referenceMaterials.find((r) => r.id === c.sourceMaterialId);
                    const srcType = srcMaterial?.type ?? "faq";
                    const srcLabel =
                      srcType === "manual"
                        ? lang === "ja" ? "オーナーズマニュアル参照" : "Owner's Manual"
                        : lang === "ja" ? "FAQ参照情報" : "FAQ";
                    return (
                      <li
                        key={c.id}
                        className={`rounded-lg border p-2.5 transition ${
                          isAdopted ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={isAdopted}
                            onChange={() => toggle(adopted, c.id, setAdopted)}
                            disabled={phase === "saved"}
                            className="mt-0.5 h-4 w-4 accent-brand-600"
                            aria-label="Mark this answer as used"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="mb-1">
                              <Badge kind={srcType}>{srcLabel}</Badge>
                            </div>
                            <p className="text-[13px] font-medium leading-snug text-slate-800">
                              {firstSentence(full)}
                            </p>
                            <details className="mt-1">
                              <summary className="cursor-pointer select-none text-[11px] font-medium text-brand-700">
                                {t("details")}
                              </summary>
                              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-600">{full}</p>
                            </details>
                            <div className="mt-1.5">
                              <Badge kind={c.confidenceLabel}>{CONF[c.confidenceLabel]}</Badge>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="py-4 text-center text-xs text-slate-400">検索結果を準備中...</p>
              )}
            </Card>

            {/* Right: Manual excerpts / inline PDF viewer */}
            <Card title={`${t("manual_excerpts")} — ${t("manual_src")}`} className="!p-3">
              {viewPage !== null ? (
                /* ── Inline PDF viewer ── */
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewPage((p) => Math.max(1, (p ?? 1) - 1))}
                        className="rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        disabled={(viewPage ?? 1) <= 1}
                      >
                        ◀
                      </button>
                      <span className="px-1.5 text-[11px] font-medium text-slate-700">
                        p.{viewPage} / 468
                      </span>
                      <button
                        onClick={() => setViewPage((p) => Math.min(468, (p ?? 1) + 1))}
                        className="rounded border border-slate-300 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        disabled={(viewPage ?? 1) >= 468}
                      >
                        ▶
                      </button>
                    </div>
                    <button
                      onClick={() => setViewPage(null)}
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                    >
                      ← 一覧に戻る
                    </button>
                  </div>
                  <iframe
                    key={viewPage}
                    src={`/manual.pdf#page=${viewPage}&toolbar=0&view=FitH`}
                    className="h-[540px] w-full rounded border border-slate-200"
                    title={`オーナーズマニュアル p.${viewPage}`}
                  />
                </div>
              ) : manualHits.length > 0 ? (
                /* ── Hit list ── */
                <>
                  <ul className="space-y-2">
                    {manualHits.map((h) => (
                      <li key={h.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="min-w-0 truncate text-[11px] font-medium text-brand-700">
                            {h.section} <span className="text-slate-400">· p.{h.page}</span>
                          </p>
                          <button
                            onClick={() => setViewPage(h.page)}
                            className="shrink-0 rounded border border-brand-200 bg-white px-2 py-0.5 text-[10px] font-medium text-brand-700 hover:bg-brand-50"
                          >
                            {t("view_page")}
                          </button>
                        </div>
                        <p className="mt-1 line-clamp-4 whitespace-pre-line text-[11px] leading-relaxed text-slate-600">
                          {h.snippet}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-[10px] leading-snug text-slate-400">{t("manual_note_en")}</p>
                </>
              ) : (
                <p className="py-4 text-center text-xs text-slate-400">
                  {isSearching ? "マニュアルを検索中..." : "該当箇所が見つかりませんでした"}
                </p>
              )}
            </Card>
          </div>

          {/* Bottom row: Confirmation questions + Next actions/References + Outcome */}
          {scenario && (
            <div className="grid gap-3 lg:grid-cols-3">
              {/* Col 1: Confirmation questions */}
              <Card title={`${t("step_confirm")} — ${t("confirm_hint")}`} className="!p-3">
                <ul className="space-y-2">
                  {scenario.confirmationQuestions.map((q) => (
                    <li key={q.id}>
                      <p className="text-[13px] font-medium leading-snug text-slate-700">
                        {jaContent(q.id, q.questionText, lang)}
                      </p>
                      <input
                        type="text"
                        value={cqAnswers[q.id] ?? ""}
                        onChange={(e) => setCqAnswers({ ...cqAnswers, [q.id]: e.target.value })}
                        placeholder={t("cq_placeholder")}
                        disabled={phase === "saved"}
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                      />
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Col 2: Next actions + References */}
              <div className="space-y-3">
                <Card title={`${t("next_actions")} — ${t("na_hint")}`} className="!p-3">
                  <ul className="space-y-1.5">
                    {scenario.nextActions.map((a) => (
                      <li key={a.id} className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={actionsTaken.has(a.id)}
                          onChange={() => toggle(actionsTaken, a.id, setActionsTaken)}
                          disabled={phase === "saved"}
                          className="mt-0.5 h-4 w-4 accent-brand-600"
                          aria-label="Mark this action as done"
                        />
                        <span className="text-xs leading-snug text-slate-700">
                          {jaContent(a.id, a.actionText, lang)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title={t("references")} className="!p-3">
                  <ul className="space-y-1.5">
                    {scenario.referenceMaterials.map((r) => (
                      <li key={r.id} className="flex items-start gap-2 text-xs">
                        <Badge kind="neutral">{r.type.toUpperCase()}</Badge>
                        <span className="text-brand-700">{jaContent(r.id, r.title, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Col 3: Outcome + Saved summary */}
              <div className="space-y-3">
                <Card title={t("step_outcome")} className="!p-3">
                  <div className="space-y-1.5">
                    {RES_OPTS.map((o) => (
                      <label
                        key={o.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 ${
                          resolution === o.value ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="resolution"
                          value={o.value}
                          checked={resolution === o.value}
                          onChange={() => setResolution(o.value)}
                          disabled={phase === "saved"}
                          className="accent-brand-600"
                        />
                        <span className="text-xs">
                          <span className="font-medium text-slate-800">{o.label}</span>
                          <span className="ml-1.5 text-[10px] text-slate-500">{o.hint}</span>
                        </span>
                      </label>
                    ))}
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t("note_placeholder")}
                      rows={1}
                      disabled={phase === "saved"}
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                    />

                    {/* Info-gap field — shown when the inquiry was NOT resolved */}
                    {resolution !== "" && resolution !== "resolved" && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                        <label className="mb-1 block text-[11px] font-semibold text-amber-800">
                          {lang === "ja"
                            ? "不足していた情報・回答できなかった理由"
                            : "Missing information / Reason unable to answer"}
                          <span className="ml-1 text-[10px] font-normal text-amber-600">
                            {lang === "ja" ? "（ナレッジ改善に活用されます）" : "(used to improve knowledge base)"}
                          </span>
                        </label>
                        <textarea
                          value={infoGapNote}
                          onChange={(e) => setInfoGapNote(e.target.value)}
                          placeholder={
                            lang === "ja"
                              ? "例）スターターがまわらない場合の電気系統診断手順がなかった"
                              : "e.g. No diagnostic steps for electrical faults when starter won't turn"
                          }
                          rows={2}
                          disabled={phase === "saved"}
                          className="w-full rounded-md border border-amber-300 bg-white px-2 py-1 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => canComplete && setPhase("saved")}
                      disabled={!canComplete || phase === "saved"}
                      className="w-full rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t("complete_btn")}
                    </button>
                    {!canComplete && phase === "results" && (
                      <p className="text-center text-[10px] leading-snug text-amber-600">{t("outcome_required")}</p>
                    )}
                  </div>
                </Card>

                {phase === "saved" && savedSummary && (
                  <Card className="!p-3 border-emerald-200 bg-emerald-50">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                        ✓
                      </span>
                      <div className="text-xs text-emerald-900">
                        <p className="font-semibold">{t("saved_title")}</p>
                        <p className="mt-0.5 text-emerald-800">
                          {vehicle.brand} {vehicle.model} · {countryEntry.name} ·{" "}
                          {channel === "voice" ? t("ch_voice") : t("ch_text")} — {t("outcome_label")}:{" "}
                          <span className="font-medium">
                            {RES_OPTS.find((o) => o.value === resolution)?.label}
                          </span>
                          . {savedSummary.adoptedCount}/{savedSummary.candidateCount} {t("adopted_label")}.{" "}
                          {t("saved_body")}
                        </p>
                        {infoGapNote && (
                          <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5">
                            <p className="text-[10px] font-semibold text-amber-700">
                              {lang === "ja" ? "記録された不足情報" : "Recorded knowledge gap"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-amber-900">{infoGapNote}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
