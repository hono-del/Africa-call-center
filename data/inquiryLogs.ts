// Demo inquiry logs (30 records) generated to reflect realistic market weighting:
// Toyota-heavy (Hilux above all), Suzuki growing, high grey-import ratio.
// Dashboard KPIs are computed from this array, so figures always stay consistent.

import { InquiryLog, ResolutionStatus, Channel, Language, SaleType } from "./types";
import { DEMO_CASES } from "./demoCases";

interface Seed {
  brand: string;
  model: string;
  sale: SaleType;
  cat: string;
  ch: Channel;
  lang: Language;
  country: string;
  status: ResolutionStatus;
  adopted: boolean; // whether any AI answer candidate was adopted
  sat?: number;
  text: string;
  daysAgo: number;
}

const SEEDS: Seed[] = [
  { brand: "Toyota", model: "Hilux", sale: "grey_import", cat: "parts_supply", ch: "text", lang: "fr", country: "CI", status: "resolved", adopted: true, sat: 5, daysAgo: 0, text: "Customer asks lead time for Hilux front brake pads, vehicle is a grey import." },
  { brand: "Toyota", model: "Hilux", sale: "new", cat: "durability", ch: "voice", lang: "en", country: "KE", status: "resolved", adopted: true, sat: 4, daysAgo: 0, text: "Knocking noise from front suspension after rural road trip." },
  { brand: "Toyota", model: "Hilux", sale: "certified_used", cat: "warranty_recall", ch: "voice", lang: "en", country: "TZ", status: "resolved", adopted: true, sat: 4, daysAgo: 1, text: "Does the certified-used warranty cover the alternator?" },
  { brand: "Toyota", model: "Hilux", sale: "grey_import", cat: "grey_import_support", ch: "text", lang: "en", country: "NG", status: "escalated", adopted: false, daysAgo: 1, text: "Grey-import Hilux: can it be serviced at the authorized center and at what price?" },
  { brand: "Toyota", model: "Hilux", sale: "new", cat: "finance_fleet", ch: "voice", lang: "fr", country: "SN", status: "resolved", adopted: true, sat: 5, daysAgo: 2, text: "Fleet lease terms for 12 Hilux units for a construction company." },
  { brand: "Toyota", model: "Hilux", sale: "grey_import", cat: "parts_supply", ch: "text", lang: "en", country: "GH", status: "pending", adopted: true, daysAgo: 2, text: "Clutch kit availability for 2016 Hilux, grey import." },
  { brand: "Toyota", model: "Land Cruiser", sale: "new", cat: "durability", ch: "voice", lang: "en", country: "KE", status: "resolved", adopted: true, sat: 5, daysAgo: 3, text: "Recommended service interval for sustained unpaved-road use." },
  { brand: "Toyota", model: "Land Cruiser", sale: "certified_used", cat: "warranty_recall", ch: "voice", lang: "fr", country: "CM", status: "resolved", adopted: true, sat: 4, daysAgo: 3, text: "Open recall check by VIN for used Land Cruiser." },
  { brand: "Toyota", model: "Land Cruiser", sale: "grey_import", cat: "parts_supply", ch: "text", lang: "en", country: "ZA", status: "escalated", adopted: false, daysAgo: 4, text: "Middle-East spec Land Cruiser: injector part mismatch, needs specialist." },
  { brand: "Toyota", model: "Hiace", sale: "grey_import", cat: "grey_import_support", ch: "voice", lang: "en", country: "NG", status: "escalated", adopted: false, daysAgo: 4, text: "Grey-import Hiace minibus operator asks about maintenance contract options." },
  { brand: "Toyota", model: "Hiace", sale: "certified_used", cat: "fuel_cost", ch: "text", lang: "en", country: "KE", status: "resolved", adopted: true, sat: 4, daysAgo: 5, text: "Fuel economy figures for Hiace diesel used as a matatu." },
  { brand: "Toyota", model: "Hiace", sale: "grey_import", cat: "parts_supply", ch: "text", lang: "fr", country: "CI", status: "resolved", adopted: true, sat: 3, daysAgo: 5, text: "Sliding door roller replacement lead time for Hiace." },
  { brand: "Toyota", model: "Corolla Cross", sale: "new", cat: "warranty_recall", ch: "voice", lang: "en", country: "ZA", status: "resolved", adopted: true, sat: 5, daysAgo: 6, text: "New Corolla Cross warranty scope for hybrid battery." },
  { brand: "Toyota", model: "Corolla Cross", sale: "new", cat: "finance_fleet", ch: "text", lang: "en", country: "GH", status: "resolved", adopted: true, sat: 4, daysAgo: 6, text: "Monthly installment simulation for Corolla Cross." },
  { brand: "Toyota", model: "Fortuner", sale: "new", cat: "accident_insurance", ch: "voice", lang: "en", country: "KE", status: "resolved", adopted: false, sat: 3, daysAgo: 7, text: "Insurance claim procedure after minor collision, Fortuner." },
  { brand: "Toyota", model: "Fortuner", sale: "certified_used", cat: "service_network", ch: "text", lang: "fr", country: "SN", status: "resolved", adopted: true, sat: 4, daysAgo: 7, text: "Nearest authorized service center around Dakar suburbs." },
  { brand: "Suzuki", model: "Swift", sale: "new", cat: "fuel_cost", ch: "text", lang: "en", country: "KE", status: "resolved", adopted: true, sat: 5, daysAgo: 8, text: "Ride-hailing driver asks real-world fuel economy of Swift." },
  { brand: "Suzuki", model: "Swift", sale: "new", cat: "finance_fleet", ch: "voice", lang: "en", country: "NG", status: "resolved", adopted: true, sat: 4, daysAgo: 8, text: "Fleet purchase discount for 20 Swifts for a ride-hailing partner." },
  { brand: "Suzuki", model: "Ertiga", sale: "new", cat: "service_network", ch: "text", lang: "en", country: "TZ", status: "resolved", adopted: true, sat: 4, daysAgo: 9, text: "Service center coverage outside Dar es Salaam for Ertiga." },
  { brand: "Suzuki", model: "Ertiga", sale: "certified_used", cat: "warranty_recall", ch: "voice", lang: "en", country: "GH", status: "pending", adopted: true, daysAgo: 9, text: "Used Ertiga: whether remaining warranty transfers to second owner." },
  { brand: "Suzuki", model: "Baleno", sale: "new", cat: "parts_supply", ch: "text", lang: "en", country: "ZA", status: "resolved", adopted: true, sat: 4, daysAgo: 10, text: "Windscreen availability and fitting lead time for Baleno." },
  { brand: "Volkswagen", model: "Polo", sale: "certified_used", cat: "parts_supply", ch: "voice", lang: "en", country: "ZA", status: "resolved", adopted: true, sat: 4, daysAgo: 10, text: "Timing belt kit lead time for Polo." },
  { brand: "Volkswagen", model: "Polo", sale: "grey_import", cat: "grey_import_support", ch: "text", lang: "fr", country: "CM", status: "escalated", adopted: false, daysAgo: 11, text: "EU-spec Polo grey import: infotainment language change support?" },
  { brand: "Nissan", model: "NP200", sale: "new", cat: "durability", ch: "voice", lang: "en", country: "ZA", status: "resolved", adopted: true, sat: 4, daysAgo: 11, text: "Load capacity and suspension care for daily heavy loads." },
  { brand: "Nissan", model: "NP200", sale: "certified_used", cat: "accident_insurance", ch: "text", lang: "en", country: "ZA", status: "pending", adopted: false, daysAgo: 12, text: "Repair estimate flow with third-party insurer after rear-end accident." },
  { brand: "Hyundai", model: "Grand i10", sale: "new", cat: "fuel_cost", ch: "text", lang: "en", country: "NG", status: "resolved", adopted: true, sat: 5, daysAgo: 12, text: "Running cost comparison for Grand i10 city use." },
  { brand: "Hyundai", model: "Grand i10", sale: "grey_import", cat: "warranty_recall", ch: "voice", lang: "fr", country: "CI", status: "escalated", adopted: false, daysAgo: 13, text: "Grey-import i10: airbag recall — is free repair possible?" },
  { brand: "Ford", model: "Ranger", sale: "new", cat: "durability", ch: "voice", lang: "en", country: "GH", status: "resolved", adopted: true, sat: 4, daysAgo: 13, text: "Dust ingress in cabin on laterite roads, filter options." },
  { brand: "Ford", model: "Ranger", sale: "certified_used", cat: "parts_supply", ch: "text", lang: "en", country: "KE", status: "resolved", adopted: true, sat: 3, daysAgo: 14, text: "Turbo actuator availability for used Ranger." },
  { brand: "Toyota", model: "Hilux", sale: "grey_import", cat: "grey_import_support", ch: "text", lang: "fr", country: "SN", status: "escalated", adopted: false, daysAgo: 14, text: "Thai-spec Hilux: navigation map update path unknown, no KB article." }
];

const OPERATORS = [
  { id: "op_01", name: "A. Mwangi" },
  { id: "op_02", name: "F. Diabaté" },
  { id: "op_03", name: "S. Okafor" },
  { id: "op_04", name: "L. Ndlovu" }
];

function iso(daysAgo: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
}

function mockMins(status: string, idx: number): number {
  if (status === "escalated") return 14 + (idx % 7);
  if (status === "pending") return 8 + (idx % 5);
  return 4 + (idx % 6);
}

const BASE_LOGS: InquiryLog[] = SEEDS.map((s, i) => {
  const op = OPERATORS[i % OPERATORS.length];
  const id = `inq_${String(i + 1).padStart(3, "0")}`;
  return {
    id,
    createdAt: iso(s.daysAgo, 9 + (i % 8)),
    handlingTimeMins: mockMins(s.status, i),
    channel: s.ch,
    language: s.lang,
    operatorId: op.id,
    operatorName: op.name,
    distributorId: `dist_${s.country.toLowerCase()}_01`,
    country: s.country,
    productCategory: "automotive",
    vehicleBrand: s.brand,
    vehicleModel: s.model,
    saleType: s.sale,
    inquiryCategory: s.cat,
    rawInquiryText: s.text,
    searchLogs: [
      {
        id: `search_${String(i + 1).padStart(3, "0")}`,
        inquiryLogId: id,
        executedAt: iso(s.daysAgo, 9 + (i % 8)),
        searchKeyword: s.text.split(" ").slice(0, 6).join(" "),
        answerCandidates: [
          {
            id: `ac_${i}_1`,
            answerText: "(mock candidate)",
            confidenceLabel: s.adopted ? "high" : "low",
            wasAdopted: s.adopted
          }
        ],
        confirmationQuestions: [],
        referenceMaterials: [],
        nextActions: []
      }
    ],
    resolution: {
      id: `res_${String(i + 1).padStart(3, "0")}`,
      inquiryLogId: id,
      status: s.status,
      recordedAt: iso(s.daysAgo, 10 + (i % 8)),
      recordedBy: op.id
    },
    satisfactionScore: s.sat
  };
});

// ---------------------------------------------------------------------------
// Logs derived from the 10 scripted demo cases (data/demoCases.ts).
// Context (channel / country / language / sale type / recency) assigned here.
// ---------------------------------------------------------------------------

interface DemoCaseContext {
  ch: Channel;
  lang: Language;
  country: string;
  sale: SaleType;
  daysAgo: number;
  sat?: number;
}

const DEMO_CASE_CONTEXT: Record<string, DemoCaseContext> = {
  case_001: { ch: "voice", lang: "en", country: "KE", sale: "certified_used", daysAgo: 0, sat: 5 },
  case_002: { ch: "voice", lang: "en", country: "GH", sale: "new", daysAgo: 0, sat: 4 },
  case_003: { ch: "text", lang: "en", country: "NG", sale: "new", daysAgo: 1, sat: 4 },
  case_004: { ch: "text", lang: "fr", country: "SN", sale: "certified_used", daysAgo: 1, sat: 5 },
  case_005: { ch: "text", lang: "fr", country: "CI", sale: "grey_import", daysAgo: 2 },
  case_006: { ch: "voice", lang: "en", country: "TZ", sale: "new", daysAgo: 2, sat: 5 },
  case_007: { ch: "voice", lang: "en", country: "KE", sale: "grey_import", daysAgo: 3 },
  case_008: { ch: "text", lang: "en", country: "ZA", sale: "new", daysAgo: 3, sat: 4 },
  case_009: { ch: "voice", lang: "en", country: "ZA", sale: "certified_used", daysAgo: 4 },
  case_010: { ch: "text", lang: "fr", country: "CM", sale: "certified_used", daysAgo: 4, sat: 4 }
};

const DEMO_CASE_LOGS: InquiryLog[] = DEMO_CASES.map((dc, i) => {
  const ctx = DEMO_CASE_CONTEXT[dc.case_id];
  const op = OPERATORS[i % OPERATORS.length];
  const [brand, ...modelParts] = dc.vehicle_model.split(" ");
  const id = `inq_${dc.case_id}`;
  // Adoption mirrors the case outcome: escalated cases represent knowledge gaps
  // (no candidate adopted); resolved/pending cases had a usable candidate.
  const adopted = dc.resolution_status !== "escalated";
  return {
    id,
    createdAt: iso(ctx.daysAgo, 11 + (i % 6)),
    handlingTimeMins: mockMins(dc.resolution_status, i + 30),
    channel: ctx.ch,
    language: ctx.lang,
    operatorId: op.id,
    operatorName: op.name,
    distributorId: `dist_${ctx.country.toLowerCase()}_01`,
    country: ctx.country,
    productCategory: "automotive",
    vehicleBrand: brand,
    vehicleModel: modelParts.join(" "),
    saleType: ctx.sale,
    inquiryCategory: dc.category,
    rawInquiryText: dc.customer_question,
    searchLogs: [
      {
        id: `search_${dc.case_id}`,
        inquiryLogId: id,
        executedAt: iso(ctx.daysAgo, 11 + (i % 6)),
        searchKeyword: dc.customer_question.split(" ").slice(0, 6).join(" "),
        answerCandidates: [
          {
            id: `ac_log_${dc.case_id}`,
            answerText: dc.suggested_answer,
            confidenceLabel: adopted ? "high" : "medium",
            wasAdopted: adopted
          }
        ],
        confirmationQuestions: [
          { id: `cq_log_${dc.case_id}`, questionText: dc.next_best_question }
        ],
        referenceMaterials: dc.reference_sources.map((title, j) => ({
          id: `rm_log_${dc.case_id}_${j + 1}`,
          title,
          type: "faq" as const
        })),
        nextActions: []
      }
    ],
    resolution: {
      id: `res_${dc.case_id}`,
      inquiryLogId: id,
      status: dc.resolution_status,
      recordedAt: iso(ctx.daysAgo, 12 + (i % 6)),
      recordedBy: op.id
    },
    satisfactionScore: ctx.sat
  };
});

export const INQUIRY_LOGS: InquiryLog[] = [...BASE_LOGS, ...DEMO_CASE_LOGS];
