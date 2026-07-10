"use client";

// Lightweight EN/JA i18n without external libraries.
// UI strings live in the dictionary below; scripted scenario content is
// translated via data/scenarioTranslations.ts (keyed by content id).

import { createContext, useContext, useState } from "react";

export type Lang = "en" | "ja";

const DICT: Record<string, { en: string; ja: string }> = {
  // Header / nav
  nav_dashboard: { en: "Dashboard", ja: "ダッシュボード" },
  nav_assist: { en: "Agent Assist", ja: "対応支援" },
  signed_in: { en: "Signed in as", ja: "ログイン中：" },
  agent_role: { en: "(Agent)", ja: "（担当者）" },

  // Assist screen
  assist_title: { en: "Agent Assist", ja: "対応支援（Agent Assist）" },
  assist_sub: {
    en: "Search the knowledge base and record the outcome. Every interaction is logged.",
    ja: "ナレッジを検索して対応し、結果を記録します。すべての対応はログとして蓄積されます。"
  },
  new_inquiry: { en: "Start new inquiry", ja: "新規対応を開始" },
  step1: { en: "1 · Intake & customer's question", ja: "1 · 受付・お客様の質問" },
  channel: { en: "Channel", ja: "チャネル" },
  ch_text: { en: "Text (WhatsApp / SMS)", ja: "テキスト（WhatsApp / SMS）" },
  ch_voice: { en: "Voice call", ja: "音声通話" },
  country: { en: "Country", ja: "国" },
  vehicle: { en: "Vehicle", ja: "車種" },
  sale_type: { en: "Sale type", ja: "販売形態" },
  category: { en: "Category", ja: "カテゴリ" },
  q_placeholder: {
    en: 'Type the customer\'s question, e.g. "The engine won\'t start, the starter clicks once."',
    ja: "お客様の質問・症状を入力（例：エンジンがかからない、スターターがカチッと鳴るだけ）"
  },
  q_note: {
    en: "Stored as the search keyword in the interaction log.",
    ja: "この入力は検索キーワードとして対応ログに記録されます。"
  },
  search_btn: { en: "Search with AI", ja: "AIで検索" },
  searching: { en: "Searching…", ja: "検索中…" },
  searching_msg: {
    en: "AI is searching FAQs, manuals and past interactions…",
    ja: "AIがFAQ・マニュアル・過去対応を検索しています…"
  },
  step_candidates: { en: "2 · Answer candidates", ja: "2 · 回答候補" },
  candidates_hint: { en: "check the one(s) you used", ja: "使用した候補にチェック" },
  details: { en: "Details", ja: "詳細" },
  step_confirm: { en: "3 · Confirmation questions", ja: "3 · 確認質問" },
  confirm_hint: { en: "ask the customer, note the answers", ja: "お客様に確認し、回答をメモ" },
  cq_placeholder: { en: "Customer's answer (optional)", ja: "お客様の回答（任意）" },
  next_actions: { en: "Next actions", ja: "次のアクション" },
  na_hint: { en: "check what you did", ja: "実施したものにチェック" },
  references: { en: "References", ja: "参考資料" },
  manual_excerpts: { en: "Manual excerpts", ja: "マニュアル該当箇所" },
  manual_src: { en: "HILUX Owner's Manual (JP)", ja: "ハイラックス取扱書" },
  view_page: { en: "View page", ja: "ページを見る" },
  manual_note_en: {
    en: "Retrieved from the actual Owner's Manual (Japanese source). In production the AI layer would translate/summarize these for EN/FR agents.",
    ja: "実際の取扱書から検索した該当箇所です。本実装ではAIが担当者の言語に翻訳・要約して提示します。"
  },
  step_outcome: { en: "4 · Outcome (required)", ja: "4 · 対応結果の記録（必須）" },
  res_resolved: { en: "Resolved", ja: "解決済み" },
  res_resolved_hint: { en: "Customer's question was answered", ja: "お客様の質問に回答できた" },
  res_escalated: { en: "Escalated", ja: "エスカレ" },
  res_escalated_hint: { en: "Handed over to a specialist", ja: "専門担当・上位者へ引き継ぎ" },
  res_pending: { en: "Pending", ja: "保留中" },
  res_pending_hint: { en: "Waiting on follow-up", ja: "お客様・社内の回答待ち" },
  res_pending_customer: { en: "Pending — awaiting customer", ja: "保留：お客様の回答待ち" },
  res_pending_customer_hint: { en: "Customer needs to check and get back to us", ja: "お客様が確認して折り返す予定" },
  res_pending_no_answer: { en: "Pending — could not answer", ja: "保留：その場で回答できなかった" },
  res_pending_no_answer_hint: { en: "Question could not be answered on the spot; follow-up required", ja: "即答できず、後日調査・折り返しが必要" },
  note_placeholder: { en: "Note (optional)", ja: "メモ（任意）" },
  complete_btn: { en: "Complete & save log", ja: "対応を終了してログ保存" },
  outcome_required: {
    en: "Select an outcome before completing — this keeps the resolution-rate KPI reliable.",
    ja: "対応結果を選択してください（解決率KPIの信頼性を保つため必須です）"
  },
  saved_title: { en: "Interaction log saved.", ja: "対応ログを保存しました。" },
  saved_body: {
    en: "This log now feeds the analysis and FAQ-improvement cycle.",
    ja: "このログは分析・FAQ改善サイクルの入力データになります。"
  },
  outcome_label: { en: "outcome", ja: "結果" },
  adopted_label: { en: "candidates adopted", ja: "件の回答候補を採用" },

  // Manual page modal
  manual_page: { en: "Owner's Manual — page", ja: "取扱書 — ページ" },
  prev_page: { en: "← Prev", ja: "← 前ページ" },
  next_page: { en: "Next →", ja: "次ページ →" },
  close: { en: "Close", ja: "閉じる" },
  page_text_note: {
    en: "Text view of the actual manual page (the PDF's fonts prevent image rendering). Page numbers match the printed/PDF manual for cross-checking.",
    ja: "実際の取扱書ページの本文表示です（PDFのフォント仕様により画像表示は不可）。ページ番号は紙・PDFの取扱書と一致するため照合に使えます。"
  },

  // Dashboard
  dash_title: { en: "Manager Dashboard", ja: "管理者ダッシュボード" },
  dash_sub: { en: "Last 15 days · all distributors · demo data", ja: "直近15日 · 全代理店 · デモデータ" },
  kpi_total: { en: "Total interactions", ja: "総対応件数" },
  kpi_resolution: { en: "Resolution rate", ja: "解決率" },
  kpi_ai: { en: "AI answer adoption", ja: "AI回答採用率" },
  kpi_ai_sub: { en: "≥1 candidate adopted", ja: "候補を1件以上採用" },
  kpi_sat: { en: "Avg. satisfaction", ja: "平均満足度" },
  kpi_sat_sub: { en: "responses", ja: "件の回答" },
  kpi_gaps: { en: "Knowledge gaps", ja: "ナレッジギャップ" },
  kpi_gaps_sub: { en: "No adopted answer / escalated", ja: "回答不採用・エスカレ案件" },
  by_category: { en: "Inquiries by category", ja: "カテゴリ別問い合わせ件数" },
  channel_split: { en: "Channel split", ja: "チャネル別内訳" },
  language_split: { en: "Language split", ja: "言語別内訳" },
  outcome_split: { en: "Outcome split", ja: "解決状況内訳" },
  lang_en: { en: "English", ja: "英語" },
  lang_fr: { en: "French", ja: "フランス語" },
  voice_label: { en: "Voice", ja: "音声" },
  text_label: { en: "Text (WhatsApp/SMS)", ja: "テキスト（WhatsApp/SMS）" },
  ja_note: {
    en: "Japanese UI is for internal (HQ) review, not customer-facing volume.",
    ja: "日本語UIは日本側関係者の確認用であり、顧客対応言語ではありません。"
  },
  grey_note_1: { en: "of", ja: "／" },
  grey_note_2: { en: "interactions involve grey-import vehicles.", ja: "件が並行輸入車に関する対応です。" },
  recent: { en: "Recent interactions", ja: "最近の対応履歴" },
  th_date: { en: "Date", ja: "日付" },
  th_country: { en: "Country", ja: "国" },
  th_vehicle: { en: "Vehicle", ja: "車種" },
  th_sale: { en: "Sale type", ja: "販売形態" },
  th_category: { en: "Category", ja: "カテゴリ" },
  th_channel: { en: "Channel", ja: "チャネル" },
  th_agent: { en: "Agent", ja: "担当者" },
  th_outcome: { en: "Outcome", ja: "結果" },

  // Sale types
  sale_new: { en: "New (authorized)", ja: "新車（正規）" },
  sale_used: { en: "Certified used", ja: "正規中古車" },
  sale_grey: { en: "Grey import", ja: "並行輸入車" },

  // Confidence
  conf_high: { en: "High confidence", ja: "確信度：高" },
  conf_medium: { en: "Medium confidence", ja: "確信度：中" },
  conf_low: { en: "Low confidence", ja: "確信度：低" }
};

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {}
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const { lang, setLang } = useContext(LangContext);
  const t = (key: string) => DICT[key]?.[lang] ?? DICT[key]?.en ?? key;
  return { lang, setLang, t };
}
