// Knowledge-gap details: what information was missing and how to improve.
// Keyed by inquiry log id. Used by the /dashboard/knowledge-gaps page.

export interface GapDetail {
  inquiryId: string;
  topic: string;       topicEn: string;
  infoGap: string;     infoGapEn: string;
  result: string;      resultEn: string;
  suggestion: string;  suggestionEn: string;
}

export const GAP_DETAILS: GapDetail[] = [
  {
    inquiryId: "inq_004",
    topic:      "並行輸入ハイラックス：正規サービスセンターでのメンテナンス契約の可否・料金",
    topicEn:    "Grey-import Hilux: authorised maintenance contract availability and pricing",
    infoGap:    "並行輸入車向けメンテナンス契約オプションおよびその料金体系に関するKB記事が存在しない",
    infoGapEn:  "No KB article covering maintenance contract options and pricing for grey-import vehicles",
    result:     "専門担当へエスカレーション（未解決）",
    resultEn:   "Escalated to specialist — unresolved",
    suggestion: "並行輸入車向けメンテナンスパッケージの料金・条件をFAQ記事として整備する",
    suggestionEn: "Create a FAQ article covering maintenance package terms and pricing for grey-import vehicles"
  },
  {
    inquiryId: "inq_009",
    topic:      "中東仕様ランドクルーザー（並行輸入）：インジェクター部品の仕様不一致",
    topicEn:    "Middle-East spec Land Cruiser (grey import): injector part specification mismatch",
    infoGap:    "中東仕様と国内・アフリカ仕様の部品互換性マトリックスが存在しない",
    infoGapEn:  "No parts compatibility matrix comparing Middle-East spec vs. Africa/domestic spec",
    result:     "専門担当へエスカレーション（部品調達元の特定が必要）",
    resultEn:   "Escalated to specialist — parts sourcing identification required",
    suggestion: "主要仕向地仕様の部品互換情報を部品データベースまたはKBに追加する",
    suggestionEn: "Add a parts compatibility matrix for key market specifications to the parts DB or KB"
  },
  {
    inquiryId: "inq_010",
    topic:      "並行輸入ハイエース（ミニバス仕様）：メンテナンス契約オプション",
    topicEn:    "Grey-import Hiace (minibus spec): maintenance contract options",
    infoGap:    "商用・ミニバス向け並行輸入車のメンテナンス契約に関するKB記事が存在しない",
    infoGapEn:  "No KB article on maintenance contracts for grey-import commercial/minibus vehicles",
    result:     "専門担当へエスカレーション（未解決）",
    resultEn:   "Escalated to specialist — unresolved",
    suggestion: "並行輸入商用車向けメンテナンス契約に関するFAQを新規作成する",
    suggestionEn: "Create a new FAQ article on maintenance contracts for grey-import commercial vehicles"
  },
  {
    inquiryId: "inq_023",
    topic:      "EU仕様フォルクスワーゲン・ポロ（並行輸入）：インフォテインメント言語変更",
    topicEn:    "EU-spec VW Polo (grey import): infotainment language change",
    infoGap:    "EU仕様ポロのインフォテインメント言語変更対応可否・費用のKB記事が存在しない",
    infoGapEn:  "No KB article on language change feasibility and cost for EU-spec Polo infotainment",
    result:     "専門担当へエスカレーション（未解決）",
    resultEn:   "Escalated to specialist — unresolved",
    suggestion: "他車種で実績のある言語変更手順・費用をポロにも適用できるか確認しFAQ化する",
    suggestionEn: "Verify whether the language-change procedure used on other models applies to the Polo, then document it as a FAQ"
  },
  {
    inquiryId: "inq_025",
    topic:      "日産NP200：事故後の第三者保険を使った修理見積フロー",
    topicEn:    "Nissan NP200: repair estimate flow using third-party insurer after accident",
    infoGap:    "第三者保険会社との修理見積・精算フローに関するKB記事が存在しない",
    infoGapEn:  "No KB article on the repair estimate and settlement flow with third-party insurers",
    result:     "保留（第三者保険会社からの回答待ち）",
    resultEn:   "Pending — awaiting third-party insurer response",
    suggestion: "主要保険会社との修理見積フローを標準化し、担当者向けチートシートを作成する",
    suggestionEn: "Standardise the repair estimate flow with major insurers and create an agent cheat-sheet"
  },
  {
    inquiryId: "inq_027",
    topic:      "並行輸入ヒュンダイ・グランドi10：エアバッグリコール無償対応の可否",
    topicEn:    "Grey-import Hyundai Grand i10: free airbag recall repair eligibility",
    infoGap:    "並行輸入車に対するリコール無償修理ポリシー（安全リコール適用範囲）のKB記事が不足",
    infoGapEn:  "KB article on safety recall policy for grey-import vehicles (scope of free repair) is incomplete",
    result:     "専門担当へエスカレーション（未解決）",
    resultEn:   "Escalated to specialist — unresolved",
    suggestion: "安全リコールは輸入経路を問わず無償対応するポリシーをFAQに明記し、担当者が即答できるようにする",
    suggestionEn: "Explicitly document in the FAQ that safety recalls are performed free of charge regardless of import channel, enabling agents to answer on the spot"
  },
  {
    inquiryId: "inq_030",
    topic:      "タイ仕様ハイラックス（並行輸入）：ナビゲーション地図更新パス不明",
    topicEn:    "Thai-spec Hilux (grey import): navigation map update path unknown",
    infoGap:    "タイ仕様ハイラックスのナビゲーション地図更新手順・サポート可否のKB記事が存在しない",
    infoGapEn:  "No KB article on the navigation map update procedure or support eligibility for Thai-spec Hilux",
    result:     "専門担当へエスカレーション（未解決）",
    resultEn:   "Escalated to specialist — unresolved",
    suggestion: "タイ仕様インフォテインメントの地図更新パスおよびサポート範囲をFAQに追加する",
    suggestionEn: "Add a FAQ entry covering the map update path and support scope for Thai-spec infotainment systems"
  },
  {
    inquiryId: "inq_case_005",
    topic:      "タイ仕様ハイラックス（並行輸入）：ナビゲーション言語をフランス語に変更",
    topicEn:    "Thai-spec Hilux (grey import): change navigation language to French",
    infoGap:    "タイ仕様→フランス語への言語変換対応可否・費用のKB記事が存在しない",
    infoGapEn:  "No KB article on Thai-spec to French language conversion feasibility or cost",
    result:     "専門担当へエスカレーション（インフォテインメント専門担当へ引き継ぎ）",
    resultEn:   "Escalated to infotainment specialist",
    suggestion: "タイ仕様インフォテインメントの言語・地図変換オプションと費用をKBに追加する。他仕向地仕様も同様に整備する",
    suggestionEn: "Add language/map conversion options and pricing for Thai-spec infotainment to the KB; apply the same to other market specifications"
  }
];
