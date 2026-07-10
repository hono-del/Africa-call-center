// Inquiry categories tailored to African distributor call centers.
export interface CategoryEntry {
  key: string;
  label: string;
  labelJa: string;
}

export const CATEGORIES: CategoryEntry[] = [
  { key: "parts_supply", label: "Parts supply & lead time", labelJa: "部品供給・納期" },
  { key: "service_network", label: "Service center locations", labelJa: "サービス拠点案内" },
  { key: "durability", label: "Rough-road use & durability", labelJa: "悪路走行・耐久性" },
  { key: "fuel_cost", label: "Fuel economy & running cost", labelJa: "燃費・維持費" },
  { key: "grey_import_support", label: "Grey import / used car support", labelJa: "並行輸入・中古車サポート" },
  { key: "finance_fleet", label: "Financing & fleet contracts", labelJa: "ローン・フリート契約" },
  { key: "warranty_recall", label: "Warranty & recalls", labelJa: "保証・リコール" },
  { key: "accident_insurance", label: "Accidents & insurance", labelJa: "事故・保険" },
  { key: "vehicle_operation", label: "Vehicle operation & troubleshooting", labelJa: "車両操作・トラブル対処" },
  { key: "infotainment", label: "Infotainment & connectivity", labelJa: "インフォテインメント・接続" },
  { key: "maintenance", label: "Maintenance & service timing", labelJa: "メンテナンス・点検時期" }
];

export const categoryLabel = (key: string, lang: "en" | "ja" = "en") => {
  const c = CATEGORIES.find((c) => c.key === key);
  if (!c) return key;
  return lang === "ja" ? c.labelJa : c.label;
};
