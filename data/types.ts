// Data model for the Africa Distributor Call Center PoC (Phase 1).
// See docs/04_data_model.md for the design rationale.

export type Channel = "voice" | "text";
export type Language = "en" | "fr" | "ja";
export type SaleType = "new" | "certified_used" | "grey_import";
export type ResolutionStatus = "resolved" | "escalated" | "pending" | "pending_customer" | "pending_no_answer";
export type ConfidenceLabel = "high" | "medium" | "low";

export interface ReferenceMaterial {
  id: string;
  title: string;
  type: "faq" | "manual" | "video";
  url?: string;
}

export interface ConfirmationQuestion {
  id: string;
  questionText: string;
  operatorAnswer?: string;
}

export interface NextAction {
  id: string;
  actionText: string;
  wasTaken: boolean;
}

export interface AnswerCandidate {
  id: string;
  answerText: string;
  confidenceLabel: ConfidenceLabel;
  sourceMaterialId?: string;
  wasAdopted: boolean;
}

export interface SearchLog {
  id: string;
  inquiryLogId: string;
  executedAt: string;
  searchKeyword: string;
  answerCandidates: AnswerCandidate[];
  confirmationQuestions: ConfirmationQuestion[];
  referenceMaterials: ReferenceMaterial[];
  nextActions: NextAction[];
}

export interface Resolution {
  id: string;
  inquiryLogId: string;
  status: ResolutionStatus;
  recordedAt: string;
  recordedBy: string;
  note?: string;
}

export interface InquiryLog {
  id: string;
  createdAt: string;
  handlingTimeMins?: number;
  channel: Channel;
  language: Language;
  operatorId: string;
  operatorName: string;
  distributorId: string;
  country: string; // ISO country code, e.g. "KE"
  productCategory: "automotive";
  vehicleBrand: string;
  vehicleModel: string;
  saleType: SaleType;
  inquiryCategory: string; // key from categoryMaster
  rawInquiryText: string;
  searchLogs: SearchLog[];
  resolution: Resolution;
  satisfactionScore?: number; // 1-5, optional post-call survey
}

// The mock "AI search" response shape used by the Assist screen.
export interface AssistScenario {
  id: string;
  matchKeywords: string[]; // if the operator's input contains any of these, this scenario is shown
  answerCandidates: Omit<AnswerCandidate, "wasAdopted">[];
  confirmationQuestions: Omit<ConfirmationQuestion, "operatorAnswer">[];
  referenceMaterials: ReferenceMaterial[];
  nextActions: Omit<NextAction, "wasTaken">[];
}
