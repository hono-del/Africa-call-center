// Mock AI responses for the Assist screen.
//
// Scenarios come from two sources:
//  1. The 10 scripted demo cases (data/demoCases.ts) — keyword-matched so an agent
//     can type any of the demo questions and get that case's guidance.
//  2. The original flagship scenarios (parts lead time / warranty / durability).
//
// Per CLAUDE.md, answer candidates are ALWAYS plural: each demo case's
// suggested_answer becomes the primary (high-confidence) candidate, and a
// case-specific secondary candidate is added below.

import { AssistScenario } from "./types";
import { DEMO_CASES } from "./demoCases";

// Per-case wiring: match keywords, a secondary answer candidate, and next actions.
const CASE_EXTRAS: Record<
  string,
  {
    keywords: string[];
    secondary: string;
    secondaryConfidence: "medium" | "low";
    secondarySourceId?: string;
    confirmationQuestions?: { id: string; questionText: string }[];
    nextActions: string[];
  }
> = {
  case_001: {
    keywords: [
      "won't start", "wont start", "will not start", "not start", "doesn't start",
      "does not start", "no start", "engine won", "starter", "crank", "turn over", "clicks",
      "エンジンがかからない", "エンジンかからない", "エンジンが掛からない", "エンジン掛からない",
      "始動しない", "エンジン始動", "かからない", "スターター", "エンジンをかける"
    ],
    secondary:
      "If the battery and terminals check out, a faulty starter solenoid or a poor earth strap connection can produce the same single-click symptom. This requires workshop diagnosis — do not repeatedly retry, as it can drain the battery further.",
    secondaryConfidence: "medium",
    secondarySourceId: "rm_case_001_2",
    confirmationQuestions: [
      { id: "cq_case_001_1", questionText: "Are you following the correct engine start procedure?" },
      { id: "cq_case_001_2", questionText: "Is the starter motor turning over normally?" }
    ],
    nextActions: [
      "Walk the customer through the terminal check and jump-start procedure",
      "If no-start persists, book a starter/battery diagnosis at the nearest service center"
    ]
  },
  case_002: {
    keywords: ["check engine", "engine light", "warning light", "orange light", "engine-shaped"],
    secondary:
      "A common benign cause of a steady check-engine light is a loose fuel filler cap. Ask the customer to stop safely, re-tighten the cap until it clicks, and see whether the light clears after a few drive cycles.",
    secondaryConfidence: "medium",
    nextActions: [
      "Determine whether the light is steady or flashing",
      "If flashing or power loss: advise stopping and arrange roadside support",
      "Book a diagnostic scan at the nearest authorized service center"
    ]
  },
  case_003: {
    keywords: ["bluetooth", "pair", "pairing", "connect my phone"],
    secondary:
      "If the phone connects but audio does not play, the issue is usually the audio profile selection rather than pairing — check that 'media audio' is enabled for the car in the phone's Bluetooth settings.",
    secondaryConfidence: "medium",
    nextActions: [
      "Guide the customer through delete-and-re-pair on both devices",
      "If it still fails, check head-unit software version and book an update"
    ]
  },
  case_004: {
    keywords: ["door lock", "unlock", "remote key", "key fob", "fob", "metal key"],
    secondary:
      "If a new fob battery does not fix it, strong local radio interference (common near broadcast masts or some markets) can block the remote temporarily — ask whether it fails everywhere or only at certain locations.",
    secondaryConfidence: "low",
    nextActions: [
      "Check the fob indicator light and replace the CR2032 battery if dead",
      "If unresolved, book fob re-registration at a service center"
    ]
  },
  case_005: {
    keywords: ["language", "thai", "french menu", "change the system", "navigation menu", "menus are in"],
    secondary:
      "As an interim workaround, provide the customer with a photo-based cheat sheet of the Thai menu paths for common functions while the conversion option is being confirmed.",
    secondaryConfidence: "low",
    nextActions: [
      "Confirm the purchase channel (authorized vs grey import)",
      "Escalate to the infotainment specialist for conversion options and pricing",
      "Log this as a knowledge gap (no KB article with conversion pricing)"
    ]
  },
  case_006: {
    keywords: ["how often", "service interval", "laterite", "10,000", "10000", "rough roads"],
    secondary:
      "Between services, advise a monthly self-check for dusty conditions: knock out the air filter element and inspect underbody fixings — this materially extends component life on unpaved roads.",
    secondaryConfidence: "medium",
    nextActions: [
      "Confirm current mileage and last service date",
      "Send the severe-condition maintenance table and book the next service"
    ]
  },
  case_007: {
    keywords: ["battery keeps dying", "battery dies", "drain", "sits for", "discharged after"],
    secondary:
      "As a quick isolation test, disconnect the negative terminal when parking for a few days; if the battery then holds charge, a parasitic load in the vehicle wiring or an accessory is confirmed.",
    secondaryConfidence: "medium",
    nextActions: [
      "Ask about aftermarket accessories (tracker / alarm / sound system)",
      "Book a parasitic-draw test; check battery warranty eligibility"
    ]
  },
  case_008: {
    keywords: ["tyre pressure", "tire pressure", "tpms", "pressure warning", "inflated"],
    secondary:
      "If the light returns within days after a correct reset, one tyre may have a slow puncture — recommend a soapy-water check of the valve stems and tread before assuming a sensor fault.",
    secondaryConfidence: "medium",
    nextActions: [
      "Confirm placard pressures and guide the TPMS reset procedure",
      "If the warning returns, book a puncture / sensor check"
    ]
  },
  case_009: {
    keywords: ["red battery", "battery warning", "headlights dim", "dimmer", "alternator"],
    secondary:
      "If squealing is heard from the engine bay, the drive belt may only need adjustment or replacement — a much cheaper repair than an alternator. The workshop should check belt condition first.",
    secondaryConfidence: "medium",
    nextActions: [
      "Advise avoiding long night trips until inspected",
      "Escalate: book an urgent charging-system test at the nearest service center"
    ]
  },
  case_010: {
    keywords: ["no service records", "bought the car used", "maintenance is due", "next maintenance", "service history"],
    secondary:
      "If the customer prefers to phase the cost, prioritize in this order: engine oil & filter, brake fluid, air filter, then coolant — and record everything so the service history starts from today.",
    secondaryConfidence: "medium",
    nextActions: [
      "Collect the VIN and run a recall check",
      "Book a baseline inspection and send the 'first visit' package via WhatsApp"
    ]
  }
};

function materialType(title: string): "faq" | "manual" | "video" {
  const t = title.toLowerCase();
  if (t.includes("manual") || t.includes("schedule") || t.includes("booklet") || t.includes("checklist"))
    return "manual";
  if (t.includes("video")) return "video";
  return "faq";
}

// Scenarios generated from the 10 demo cases.
const DEMO_CASE_SCENARIOS: AssistScenario[] = DEMO_CASES.map((dc) => {
  const extra = CASE_EXTRAS[dc.case_id];
  return {
    id: `scn_${dc.case_id}`,
    matchKeywords: extra.keywords,
    answerCandidates: [
      {
        id: `ac_${dc.case_id}_1`,
        answerText: dc.suggested_answer,
        confidenceLabel: dc.resolution_status === "escalated" ? "medium" : "high",
        sourceMaterialId: `rm_${dc.case_id}_1`
      },
      {
        id: `ac_${dc.case_id}_2`,
        answerText: extra.secondary,
        confidenceLabel: extra.secondaryConfidence,
        sourceMaterialId: extra.secondarySourceId ?? `rm_${dc.case_id}_1`
      }
    ],
    confirmationQuestions: extra.confirmationQuestions ?? [{ id: `cq_${dc.case_id}_1`, questionText: dc.next_best_question }],
    referenceMaterials: dc.reference_sources.map((title, i) => ({
      id: `rm_${dc.case_id}_${i + 1}`,
      title,
      type: materialType(title)
    })),
    nextActions: extra.nextActions.map((actionText, i) => ({
      id: `na_${dc.case_id}_${i + 1}`,
      actionText
    }))
  };
});

// Original flagship scenarios (kept for the 3-minute demo case).
const FLAGSHIP_SCENARIOS: AssistScenario[] = [
  {
    id: "scn_starter_noturn",
    matchKeywords: [
      "スターターが回らない", "スターター回らない", "スターターが回っていない",
      "スターターがまわらない", "スターターまわらない", "スターターがまわっていない",
      "starter won't turn", "starter not turning", "no crank", "won't crank",
      "まわらない", "スターターが動かない"
    ],
    answerCandidates: [
      {
        id: "ac_starter_1",
        answerText:
          "Starter not turning — possible causes: dead key fob battery, blown fuse, or other electrical system fault. Depending on fault type, a temporary workaround may allow the engine to start (see p.412). If dash lights and horn are also dead, the battery is likely fully discharged or the terminal is disconnected (see p.416). Contact an authorized Toyota dealer if the issue persists.",
        confidenceLabel: "high",
        sourceMaterialId: "rm_starter_manual"
      },
      {
        id: "ac_starter_2",
        answerText:
          "To check whether the starter is actually turning: listen carefully when pressing the engine switch. A single 'click' with no cranking = starter solenoid or weak battery. Continuous 'click-click-click' = low battery. Complete silence = blown fuse or fully dead battery. Also check interior lights — if dim or off, battery is the likely culprit.",
        confidenceLabel: "medium",
        sourceMaterialId: "rm_starter_faq"
      }
    ],
    confirmationQuestions: [
      { id: "cq_starter_1", questionText: "Does the electronic key fob have a working battery?" },
      { id: "cq_starter_2", questionText: "Are the interior lights and headlamps lighting up normally?" }
    ],
    referenceMaterials: [
      { id: "rm_starter_manual", title: "Hilux Owner's Manual — エンジンがかからないときは (p.412, 414)", type: "manual" },
      { id: "rm_starter_faq",   title: "FAQ: スターターの周り具合の確認方法",                      type: "faq" },
      { id: "rm_starter_p416",  title: "Hilux Owner's Manual — バッテリーあがりのとき (p.416)",      type: "manual" }
    ],
    nextActions: [
      { id: "na_starter_1", actionText: "Check the electronic key fob battery and replace if needed" },
      { id: "na_starter_2", actionText: "If battery/terminal issue: guide jump-start procedure (p.416)" },
      { id: "na_starter_3", actionText: "If unresolved: arrange tow to nearest authorized service center" }
    ]
  },
  {
    id: "scn_parts",
    matchKeywords: ["part", "parts", "lead time", "delivery", "spare", "brake", "clutch"],
    answerCandidates: [
      {
        id: "ac_parts_1",
        answerText:
          "Genuine parts stocked at the regional hub (Mombasa / Abidjan) ship within 3–5 business days. For Hilux brake and suspension parts, most items are hub-stocked. Share the part number or VIN to confirm availability.",
        confidenceLabel: "high",
        sourceMaterialId: "rm_parts_guide"
      },
      {
        id: "ac_parts_2",
        answerText:
          "Parts not held at the regional hub are ordered from the central warehouse; standard lead time is 3–6 weeks depending on port congestion and customs clearance. An express air-freight option is available at additional cost.",
        confidenceLabel: "medium",
        sourceMaterialId: "rm_parts_guide"
      },
      {
        id: "ac_parts_3",
        answerText:
          "For grey-import vehicles, some parts differ by market specification. Verify the vehicle's model code before ordering — an equivalent local-spec part may fit but should be confirmed by the service center.",
        confidenceLabel: "medium",
        sourceMaterialId: "rm_grey_faq"
      }
    ],
    confirmationQuestions: [
      { id: "cq_parts_1", questionText: "Do you have the VIN or the exact part number?" },
      { id: "cq_parts_2", questionText: "Is the vehicle an authorized-channel unit or a grey import?" },
      { id: "cq_parts_3", questionText: "Is the customer able to visit the nearest authorized service center?" }
    ],
    referenceMaterials: [
      { id: "rm_parts_guide", title: "Hilux Parts Supply Guide (regional hubs & lead times)", type: "manual" },
      { id: "rm_grey_faq", title: "FAQ: Parts support for grey-import vehicles", type: "faq" }
    ],
    nextActions: [
      { id: "na_parts_1", actionText: "Confirm VIN / part number with the customer" },
      { id: "na_parts_2", actionText: "Check hub stock in the parts system and give an ETA" },
      { id: "na_parts_3", actionText: "If out of stock: offer express air-freight option and record the choice" }
    ]
  },
  {
    id: "scn_warranty",
    matchKeywords: ["warranty", "guarantee", "recall", "grey import", "coverage"],
    answerCandidates: [
      {
        id: "ac_war_1",
        answerText:
          "Authorized-channel new vehicles carry a 3-year / 100,000 km warranty. Certified used vehicles carry the remainder of the original warranty plus a 1-year certified-used extension.",
        confidenceLabel: "high",
        sourceMaterialId: "rm_warranty"
      },
      {
        id: "ac_war_2",
        answerText:
          "Grey-import vehicles are not covered by the standard distributor warranty. However, safety-recall work is performed free of charge regardless of import channel — check the VIN against the open recall list.",
        confidenceLabel: "high",
        sourceMaterialId: "rm_grey_faq2"
      },
      {
        id: "ac_war_3",
        answerText:
          "A paid service plan is available for grey-import and out-of-warranty vehicles, covering scheduled maintenance at authorized service centers.",
        confidenceLabel: "low",
        sourceMaterialId: "rm_service_plan"
      }
    ],
    confirmationQuestions: [
      { id: "cq_war_1", questionText: "Was the vehicle purchased through an authorized distributor?" },
      { id: "cq_war_2", questionText: "Do you have the VIN to check the recall list?" }
    ],
    referenceMaterials: [
      { id: "rm_warranty", title: "Warranty Terms — New & Certified Used", type: "manual" },
      { id: "rm_grey_faq2", title: "FAQ: Warranty & recall handling for grey imports", type: "faq" },
      { id: "rm_service_plan", title: "Paid Service Plan brochure", type: "faq" }
    ],
    nextActions: [
      { id: "na_war_1", actionText: "Check the VIN against the open recall list" },
      { id: "na_war_2", actionText: "Explain coverage difference by purchase channel" },
      { id: "na_war_3", actionText: "If not covered: introduce the paid service plan" }
    ]
  },
  {
    id: "scn_durability",
    matchKeywords: ["rough", "durability", "suspension", "noise", "vibration", "dust", "off-road"],
    answerCandidates: [
      {
        id: "ac_dur_1",
        answerText:
          "For sustained rough-road use, shorten the inspection interval for suspension, underbody and air filter to every 5,000 km (vs. the standard 10,000 km schedule).",
        confidenceLabel: "high",
        sourceMaterialId: "rm_rough_manual"
      },
      {
        id: "ac_dur_2",
        answerText:
          "Persistent vibration or knocking after rough-road driving commonly indicates worn shock absorbers or bushings. Recommend an underbody inspection at the nearest service center before further long-distance driving.",
        confidenceLabel: "medium",
        sourceMaterialId: "rm_rough_manual"
      }
    ],
    confirmationQuestions: [
      { id: "cq_dur_1", questionText: "When did the symptom start, and does it change with speed?" },
      { id: "cq_dur_2", questionText: "What is the current mileage and last service date?" }
    ],
    referenceMaterials: [
      { id: "rm_rough_manual", title: "Severe-Condition Maintenance Schedule (unpaved roads)", type: "manual" },
      { id: "rm_service_map", title: "Authorized service center map", type: "faq" }
    ],
    nextActions: [
      { id: "na_dur_1", actionText: "Book an underbody inspection at the nearest service center" },
      { id: "na_dur_2", actionText: "Share the severe-condition maintenance schedule with the customer" }
    ]
  }
];

// Fallback when nothing matches — keeps the demo from dead-ending and
// demonstrates the knowledge-gap flow.
const FALLBACK_SCENARIO: AssistScenario = {
  id: "scn_fallback",
  matchKeywords: [],
  answerCandidates: [
    {
      id: "ac_fb_1",
      answerText:
        "No high-confidence answer found in the current knowledge base for this question. The closest general guidance is to route the customer to the nearest authorized service center for diagnosis.",
      confidenceLabel: "low",
      sourceMaterialId: "rm_service_map_fb"
    }
  ],
  confirmationQuestions: [
    {
      id: "cq_fb_1",
      questionText: "Can you capture the exact wording of the customer's question for the knowledge team?"
    }
  ],
  referenceMaterials: [{ id: "rm_service_map_fb", title: "Authorized service center map", type: "faq" }],
  nextActions: [
    { id: "na_fb_1", actionText: "Escalate to a senior agent / product specialist" },
    { id: "na_fb_2", actionText: "Log this as a knowledge gap (auto-flagged for the manager dashboard)" }
  ]
};

// Order matters: demo-case scenarios first (more specific keywords),
// then flagship scenarios, fallback last.
export const ASSIST_SCENARIOS: AssistScenario[] = [
  ...DEMO_CASE_SCENARIOS,
  ...FLAGSHIP_SCENARIOS,
  FALLBACK_SCENARIO
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC]/g, "'") // curly/typographic apostrophes -> straight
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ");
}

export function findScenario(input: string): AssistScenario {
  const lower = normalize(input);
  // Score-based matching: the scenario with the MOST keyword hits wins.
  // This prevents generic keywords (e.g. "warning light") from shadowing a more
  // specific scenario (e.g. the red-battery/charging-system case). Ties break
  // by array order (demo cases → flagship → fallback).
  let best: AssistScenario | null = null;
  let bestScore = 0;
  for (const s of ASSIST_SCENARIOS) {
    const score = s.matchKeywords.filter((k) => lower.includes(normalize(k))).length;
    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  }
  return best ?? FALLBACK_SCENARIO;
}
