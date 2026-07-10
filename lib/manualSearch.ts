// Lightweight lexical RAG over the HILUX Owner's Manual (Japanese).
// This is retrieval-only ("RAG-lite"): it finds the most relevant manual
// passages for a query. In a production build this would be replaced by
// embedding-based retrieval + LLM answer generation.
//
// English queries are expanded to Japanese search terms via a topic
// dictionary; Japanese queries are matched directly (with bigrams).

import CHUNKS from "@/data/manualChunks.json";

export interface ManualChunk {
  id: string;
  section: string;
  page: number;
  part: number;
  text: string;
}

export interface ManualHit extends ManualChunk {
  score: number;
}

const EN2JP: Record<string, string[]> = {
  engine: ["エンジン"],
  start: ["かからない", "始動", "かけ方"],
  starter: ["スターター", "まわらない", "始動"],
  crank: ["スターター", "まわらない", "始動"],
  battery: ["バッテリー"],
  dead: ["あがった"],
  dying: ["あがった"],
  drain: ["あがった"],
  jump: ["ブースター", "救援"],
  warning: ["警告灯", "警告"],
  light: ["警告灯", "ランプ"],
  tyre: ["タイヤ"],
  tire: ["タイヤ"],
  pressure: ["空気圧"],
  tpms: ["タイヤ空気圧", "空気圧警告灯"],
  inflated: ["空気圧"],
  bluetooth: ["Bluetooth"],
  phone: ["携帯電話", "スマートフォン", "Bluetooth"],
  pair: ["Bluetooth", "接続"],
  door: ["ドア"],
  lock: ["ロック", "施錠"],
  unlock: ["解錠"],
  key: ["キー", "電子キー"],
  fob: ["電子キー", "ワイヤレス"],
  remote: ["ワイヤレス", "リモコン"],
  maintenance: ["メンテナンス", "点検"],
  service: ["点検", "整備"],
  interval: ["時期", "交換"],
  navigation: ["ナビ"],
  language: ["言語"],
  fuel: ["燃料"],
  oil: ["オイル"],
  brake: ["ブレーキ"],
  headlight: ["ヘッドランプ"],
  seat: ["シート"],
  belt: ["シートベルト"],
  wiper: ["ワイパー"],
  won: ["かからない"],
  flat: ["パンク"],
  puncture: ["パンク"],
  overheat: ["オーバーヒート"],
  coolant: ["冷却水"],
  wash: ["洗車"],
  tow: ["けん引"]
};

function termsFromQuery(q: string): Set<string> {
  const lower = q.toLowerCase();
  const terms = new Set<string>();
  for (const [en, jps] of Object.entries(EN2JP)) {
    if (lower.includes(en)) jps.forEach((t) => terms.add(t));
  }
  // Direct Japanese input: whole runs + bigrams
  const jaRuns = q.match(/[ぁ-んァ-ヶ一-龯ー]{2,}/g) ?? [];
  for (const run of jaRuns) {
    terms.add(run);
    for (let i = 0; i < run.length - 1; i++) terms.add(run.slice(i, i + 2));
  }
  return terms;
}

export function searchManual(query: string, k = 3): ManualHit[] {
  const terms = termsFromQuery(query);
  if (terms.size === 0) return [];
  const scored: ManualHit[] = [];
  for (const c of CHUNKS as ManualChunk[]) {
    let score = 0;
    for (const t of terms) {
      const count = c.text.split(t).length - 1;
      if (count > 0) score += count * t.length + t.length * 4; // occurrences + presence bonus
      if (c.section.includes(t)) score += t.length * 5;
    }
    if (score > 0) scored.push({ ...c, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}
