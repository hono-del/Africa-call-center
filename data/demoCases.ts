// The 10 scripted demo cases used for customer/internal demos.
// Source of truth: demo_cases.json (same content, typed).
// These cases are wired into:
//  - assistScenarios.ts  → keyword-matched AI responses on the Assist screen
//  - inquiryLogs.ts      → dashboard sample logs (cases appear in KPIs & history)

export type DemoResolution = "resolved" | "escalated" | "pending";

export interface DemoCase {
  case_id: string;
  customer_question: string;
  vehicle_model: string; // "Brand Model"
  category: string;
  detected_intent: string;
  suggested_answer: string;
  next_best_question: string;
  reference_sources: string[];
  resolution_status: DemoResolution;
  improvement_hint: string;
}

export const DEMO_CASES: DemoCase[] = [
  {
    case_id: "case_001",
    customer_question:
      "My Hilux won't start this morning. The starter clicks once but the engine doesn't turn over. What should I do?",
    vehicle_model: "Toyota Hilux",
    category: "vehicle_operation",
    detected_intent: "engine_no_start_diagnosis",
    suggested_answer:
      "A single click with no cranking usually indicates a weak or discharged battery, or corroded battery terminals. Ask the customer to check that the terminals are tight and free of white/green corrosion, and try a jump start if cables are available. If the engine still does not crank after a jump start, the starter motor may need inspection at a service center.",
    next_best_question:
      "Are the dashboard lights dim or off when you turn the key? And when was the battery last replaced?",
    reference_sources: [
      "Hilux Owner's Manual — Starting the engine",
      "FAQ: Jump-starting procedure",
      "Battery inspection checklist"
    ],
    resolution_status: "resolved",
    improvement_hint:
      "Frequent no-start calls in the rainy season — consider a seasonal FAQ on battery care and terminal corrosion in humid climates."
  },
  {
    case_id: "case_002",
    customer_question:
      "An orange engine-shaped warning light came on while driving. Is it safe to keep driving to Kumasi?",
    vehicle_model: "Ford Ranger",
    category: "vehicle_operation",
    detected_intent: "warning_light_interpretation",
    suggested_answer:
      "A steady orange check-engine light means the engine control system has detected a fault, but driving moderately for a short distance is generally acceptable. If the light is flashing, or is accompanied by loss of power, unusual noise, or overheating, the customer should stop and arrange inspection immediately. Recommend a diagnostic scan at the nearest authorized service center as soon as possible.",
    next_best_question:
      "Is the light steady or flashing, and have you noticed any change in engine power or unusual sounds?",
    reference_sources: [
      "Ranger Owner's Manual — Warning lights and indicators",
      "FAQ: Check-engine light — steady vs flashing"
    ],
    resolution_status: "resolved",
    improvement_hint:
      "Add a one-page visual guide of warning light icons with severity levels — agents currently describe icons verbally, which is slow on voice calls."
  },
  {
    case_id: "case_003",
    customer_question:
      "I can't pair my phone with the car's Bluetooth. It finds the car but fails when connecting.",
    vehicle_model: "Suzuki Swift",
    category: "infotainment",
    detected_intent: "bluetooth_pairing_failure",
    suggested_answer:
      "Ask the customer to delete the old pairing on both the phone and the head unit, restart the phone, and pair again with the vehicle stationary. The head unit stores a limited number of devices, so removing unused ones often resolves the failure. If pairing still fails, a head-unit software update at a service center may be required.",
    next_best_question:
      "Which phone model are you using, and has this phone ever been paired with this car before?",
    reference_sources: [
      "Swift Infotainment Quick Guide — Bluetooth pairing",
      "FAQ: Bluetooth troubleshooting steps"
    ],
    resolution_status: "resolved",
    improvement_hint:
      "Bluetooth questions cluster around a few popular phone models — create model-specific pairing guides (e.g., Tecno, Infinix, Samsung A-series) common in the region."
  },
  {
    case_id: "case_004",
    customer_question:
      "The remote key no longer locks or unlocks the doors. I have to use the metal key every time.",
    vehicle_model: "Hyundai Grand i10",
    category: "vehicle_operation",
    detected_intent: "remote_door_lock_failure",
    suggested_answer:
      "The most common cause is a depleted key-fob battery (typically CR2032), which can be replaced at low cost. Ask whether the fob's indicator light blinks when a button is pressed; if it does not, replace the battery first. If the fob light works but the doors do not respond, the fob may need re-registration at a service center.",
    next_best_question: "Does the small light on the key fob blink when you press the buttons?",
    reference_sources: [
      "Grand i10 Owner's Manual — Smart key and remote",
      "FAQ: Replacing the key-fob battery"
    ],
    resolution_status: "resolved",
    improvement_hint:
      "Publish a short video showing fob battery replacement — this is a high-volume, easily self-served topic ideal for deflection to self-service."
  },
  {
    case_id: "case_005",
    customer_question:
      "The navigation and all menus are in Thai. How do I change the system to French?",
    vehicle_model: "Toyota Hilux",
    category: "infotainment",
    detected_intent: "system_language_change",
    suggested_answer:
      "For authorized-channel vehicles, the display language can be changed under Settings → General → Language. However, this vehicle appears to be a grey import with Thai-market software; French may not be included in its language pack, and map data may not cover West Africa. In that case an authorized service center can advise whether a head-unit software or hardware conversion is available, usually as paid work.",
    next_best_question:
      "Was the vehicle purchased through an authorized distributor, or imported independently?",
    reference_sources: [
      "FAQ: Language settings on multimedia systems",
      "FAQ: Infotainment support for grey-import vehicles"
    ],
    resolution_status: "escalated",
    improvement_hint:
      "Grey-import infotainment conversion has no clear knowledge-base article with pricing — recurring escalation theme; draft a country-specific conversion guide."
  },
  {
    case_id: "case_006",
    customer_question:
      "I mostly drive on rough laterite roads upcountry. How often should I service the car — the manual says every 10,000 km.",
    vehicle_model: "Toyota Land Cruiser",
    category: "maintenance",
    detected_intent: "service_interval_severe_conditions",
    suggested_answer:
      "Sustained driving on unpaved or dusty roads falls under the severe-use schedule: shorten oil and filter changes and inspection of the air filter, suspension, and underbody to every 5,000 km instead of 10,000 km. Recommend booking the next service based on current mileage and sharing the severe-condition maintenance table.",
    next_best_question: "What is your current mileage, and when was the last service completed?",
    reference_sources: [
      "Severe-Condition Maintenance Schedule (unpaved roads)",
      "Land Cruiser Warranty & Service Booklet"
    ],
    resolution_status: "resolved",
    improvement_hint:
      "Severe-use intervals are asked constantly but buried in the service booklet — surface them as a standalone FAQ per model."
  },
  {
    case_id: "case_007",
    customer_question:
      "My battery keeps dying if the car sits for three or four days. The battery is only eight months old.",
    vehicle_model: "Toyota Hiace",
    category: "vehicle_operation",
    detected_intent: "battery_drain_investigation",
    suggested_answer:
      "A healthy battery should hold charge for several weeks, so a drain within days suggests a parasitic load — commonly an aftermarket accessory (tracker, alarm, or sound system) wired incorrectly, or a faulty relay. Since the battery is only eight months old it is likely still under its own warranty. Recommend a parasitic-draw test at a service center and, if an aftermarket device is fitted, mention it at booking.",
    next_best_question:
      "Have any accessories such as a GPS tracker, alarm, or sound system been installed after purchase?",
    reference_sources: [
      "FAQ: Battery discharge and parasitic drain",
      "Battery warranty terms",
      "Authorized service center map"
    ],
    resolution_status: "pending",
    improvement_hint:
      "Aftermarket tracker installations are extremely common for fleet vehicles — add a knowledge article on tracker wiring standards and battery drain."
  },
  {
    case_id: "case_008",
    customer_question:
      "The tyre pressure warning light stays on even after I inflated all four tyres at the fuel station.",
    vehicle_model: "Toyota Corolla Cross",
    category: "vehicle_operation",
    detected_intent: "tpms_warning_reset",
    suggested_answer:
      "After adjusting pressures, the TPMS must be reset: with the ignition on, press and hold the TPMS reset button until the warning light blinks, then drive for a few minutes so the system re-learns the values. Also confirm the spare tyre pressure if the vehicle monitors it, and check that pressures match the door-jamb placard (not the maximum printed on the tyre).",
    next_best_question:
      "Did you set the pressures to the values on the driver's door placard, and have you tried the TPMS reset button?",
    reference_sources: [
      "Corolla Cross Owner's Manual — TPMS reset procedure",
      "FAQ: Correct tyre pressures and hot vs cold inflation"
    ],
    resolution_status: "resolved",
    improvement_hint:
      "Fuel-station gauges in the region are often inaccurate — add a note recommending verification with a hand gauge; frequent repeat calls on this topic."
  },
  {
    case_id: "case_009",
    customer_question:
      "A red battery warning light comes on intermittently while driving, and at night the headlights seem dimmer.",
    vehicle_model: "Nissan NP200",
    category: "vehicle_operation",
    detected_intent: "charging_system_fault",
    suggested_answer:
      "A red battery light while driving indicates the charging system (alternator or drive belt), not just the battery. Combined with dimming headlights this suggests the alternator is failing or the belt is slipping. Advise the customer to avoid long night trips and have the charging system tested promptly; if the light stays on solid, the vehicle may stop once the battery is depleted.",
    next_best_question:
      "Do you hear any squealing noise from the engine bay, especially when starting or with the air conditioner on?",
    reference_sources: [
      "NP200 Owner's Manual — Charging system warning",
      "FAQ: Alternator vs battery symptoms"
    ],
    resolution_status: "escalated",
    improvement_hint:
      "Agents confuse battery-warranty cases with alternator faults — add a decision tree distinguishing battery vs charging-system symptoms."
  },
  {
    case_id: "case_010",
    customer_question:
      "How do I know when my next maintenance is due? I bought the car used and have no service records.",
    vehicle_model: "Suzuki Ertiga",
    category: "maintenance",
    detected_intent: "service_history_unknown_baseline",
    suggested_answer:
      "With no service history, recommend a baseline inspection at an authorized service center: engine oil and filter change, plus checks of brake fluid, coolant, air filter, belts, and tyres. From that point, follow the standard schedule (or the severe-use schedule for mostly rough-road driving). The service center can also check whether any recall or campaign work is outstanding using the VIN.",
    next_best_question:
      "Do you have the VIN handy so we can check for any outstanding recall work at the same time?",
    reference_sources: [
      "Ertiga Periodic Maintenance Schedule",
      "FAQ: Buying a used vehicle — recommended baseline inspection",
      "Recall lookup procedure"
    ],
    resolution_status: "resolved",
    improvement_hint:
      "Used-vehicle owners with no records are a large segment — create a 'first visit' package page agents can send directly via WhatsApp."
  }
];
