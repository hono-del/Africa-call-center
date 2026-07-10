// Category auto-classification based on keyword matching.
// In production this would be replaced by an LLM call, but for the PoC
// a scored keyword approach gives deterministic, explainable results.

import { CATEGORIES } from "@/data/categoryMaster";

interface RuleSet {
  categoryKey: string;
  /** Weight multiplier for this category (default 1). Raise for unambiguous terms. */
  weight?: number;
  keywords: string[];
}

const RULES: RuleSet[] = [
  {
    categoryKey: "vehicle_operation",
    weight: 1.2,
    keywords: [
      // JA
      "エンジン", "スターター", "始動", "かからない", "エンスト",
      "ブレーキ", "ハンドル", "ギア", "シフト", "バッテリー", "電気",
      "動かない", "走らない", "止まらない", "異音", "振動", "ガタガタ",
      "オーバーヒート", "警告灯", "ランプ", "ライト", "ウインカー",
      "ワイパー", "エアコン", "エアバッグ", "タイヤ空気圧", "パンク",
      "クラッチ", "ミッション", "チェックランプ", "エラーコード",
      // EN
      "engine", "starter", "crank", "won't start", "stall",
      "brake", "steering", "gear", "shift", "battery", "electrical",
      "won't move", "won't drive", "noise", "vibration", "overheat",
      "warning light", "check engine", "fault", "error code",
      "air conditioning", "ac", "airbag", "flat tyre", "flat tire",
      "clutch", "transmission", "wiper", "indicator", "headlight"
    ]
  },
  {
    categoryKey: "parts_supply",
    keywords: [
      // JA
      "部品", "パーツ", "在庫", "納期", "入荷", "取り寄せ", "注文", "供給",
      "スペアパーツ", "交換部品", "純正", "リビルト",
      // EN
      "parts", "spare", "stock", "lead time", "delivery", "order",
      "supply", "genuine", "oem", "availability", "procurement"
    ]
  },
  {
    categoryKey: "maintenance",
    keywords: [
      // JA
      "オイル交換", "エンジンオイル", "フィルター", "ベルト", "定期点検",
      "交換時期", "メンテナンス", "整備", "車検", "点検", "消耗品",
      "プラグ", "エアフィルター", "クーラント", "ブレーキパッド",
      // EN
      "oil change", "engine oil", "filter", "belt", "service interval",
      "scheduled service", "maintenance", "inspection", "coolant",
      "spark plug", "brake pad", "consumables"
    ]
  },
  {
    categoryKey: "service_network",
    keywords: [
      // JA
      "サービスセンター", "修理工場", "整備工場", "どこ", "近く", "拠点",
      "ディーラー", "販売店", "場所", "持ち込み", "予約",
      // EN
      "service centre", "service center", "workshop", "garage", "dealer",
      "dealership", "where", "location", "nearest", "appointment", "book"
    ]
  },
  {
    categoryKey: "warranty_recall",
    keywords: [
      // JA
      "保証", "リコール", "無償修理", "保証期間", "保証書", "保証範囲",
      "製造不良", "欠陥", "無料修理",
      // EN
      "warranty", "recall", "free repair", "guarantee", "coverage",
      "defect", "manufacturing", "campaign"
    ]
  },
  {
    categoryKey: "fuel_cost",
    keywords: [
      // JA
      "燃費", "燃料", "ガソリン", "軽油", "ディーゼル", "コスト", "維持費",
      "節約", "経費", "燃料代", "走行コスト",
      // EN
      "fuel", "petrol", "diesel", "mpg", "fuel economy", "running cost",
      "consumption", "efficiency", "cost per km"
    ]
  },
  {
    categoryKey: "grey_import_support",
    weight: 1.3,
    keywords: [
      // JA
      "並行輸入", "並行車", "グレーインポート", "正規外", "保証外",
      "中古車", "中古", "認定中古", "非正規", "海外仕様",
      // EN
      "grey import", "gray import", "parallel import", "used car",
      "second-hand", "non-genuine", "unofficialspec", "unofficial spec",
      "certified used"
    ]
  },
  {
    categoryKey: "accident_insurance",
    keywords: [
      // JA
      "事故", "衝突", "保険", "修理費", "見積", "クレーム", "損傷", "傷",
      "凹み", "ぶつけた", "交通事故", "自損", "損害",
      // EN
      "accident", "collision", "insurance", "claim", "damage", "dent",
      "scratch", "crash", "repair cost", "estimate"
    ]
  },
  {
    categoryKey: "durability",
    keywords: [
      // JA
      "悪路", "オフロード", "耐久", "錆", "さび", "腐食", "泥", "水没",
      "荒れた道", "未舗装", "砂利道", "耐水", "四駆", "4WD",
      // EN
      "rough road", "off-road", "offroad", "durability", "rust",
      "corrosion", "mud", "flood", "unpaved", "gravel", "4wd", "4x4"
    ]
  },
  {
    categoryKey: "finance_fleet",
    keywords: [
      // JA
      "ローン", "分割払い", "フリート", "法人", "契約", "金利", "月払い",
      "割賦", "リース", "台数",
      // EN
      "loan", "finance", "installment", "instalment", "fleet", "corporate",
      "contract", "interest rate", "monthly payment", "lease"
    ]
  },
  {
    categoryKey: "infotainment",
    keywords: [
      // JA
      "ナビ", "ナビゲーション", "地図", "地図更新", "Bluetooth", "ブルートゥース",
      "オーディオ", "言語設定", "言語変更", "画面", "ディスプレイ",
      "インフォテインメント", "CarPlay", "Android Auto", "USB", "接続",
      // EN
      "navigation", "nav", "gps", "map", "maps update", "bluetooth",
      "audio", "language", "display", "screen", "infotainment",
      "carplay", "android auto", "usb", "connectivity", "radio"
    ]
  }
];

export interface ClassifyResult {
  categoryKey: string;
  confidence: "high" | "medium" | "low";
  /** Total score (for debugging / display) */
  score: number;
  /** Top matching keywords found in the query */
  matchedKeywords: string[];
}

/**
 * Classify the inquiry category from a free-text query.
 * Returns null when no keyword matches at all.
 */
export function classifyCategory(query: string): ClassifyResult | null {
  const q = query.toLowerCase();

  const scores: Record<string, { score: number; matched: string[] }> = {};

  for (const rule of RULES) {
    const weight = rule.weight ?? 1;
    for (const kw of rule.keywords) {
      if (q.includes(kw.toLowerCase())) {
        if (!scores[rule.categoryKey]) {
          scores[rule.categoryKey] = { score: 0, matched: [] };
        }
        // Longer keywords get a higher base score (more specific = more signal)
        const base = Math.min(kw.length / 3, 4);
        scores[rule.categoryKey].score += base * weight;
        scores[rule.categoryKey].matched.push(kw);
      }
    }
  }

  const entries = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
  if (entries.length === 0) return null;

  const [topKey, topVal] = entries[0];

  // Confidence based on score and gap to second place
  const secondScore = entries[1]?.[1].score ?? 0;
  const gap = topVal.score - secondScore;

  let confidence: "high" | "medium" | "low";
  if (topVal.score >= 6 && gap >= 3)       confidence = "high";
  else if (topVal.score >= 2 || gap >= 1)  confidence = "medium";
  else                                      confidence = "low";

  return {
    categoryKey: topKey,
    confidence,
    score: topVal.score,
    matchedKeywords: topVal.matched.slice(0, 3)  // show at most 3 matched terms
  };
}

/** Validate that the returned key actually exists in the category master */
export function isValidCategoryKey(key: string): boolean {
  return CATEGORIES.some((c) => c.key === key);
}
