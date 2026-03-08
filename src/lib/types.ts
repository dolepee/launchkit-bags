export type ProjectStage = "sourced" | "drafting" | "review" | "approved" | "launch-ready" | "launched";

export type ReviewDecision = "approved" | "needs-edits" | "rejected" | null;

export type BagsStatus = "planned" | "configured" | "ready";

export type ProofStatus = "queued" | "in-progress" | "done";

export type CandidateProject = {
  id: string;
  slug: string;
  name: string;
  sector: string;
  builderName: string;
  contactHandle: string;
  contactChannel: string;
  fitScore: number;
  priority: "high" | "medium" | "low";
  status: ProjectStage;
  summary: string;
  lastTouch: string;
};

export type FeeRecipient = {
  role: string;
  share: number;
  handle: string;
  reason: string;
};

export type BagsModule = {
  key: string;
  label: string;
  status: BagsStatus;
  note: string;
};

export type ChecklistItem = {
  label: string;
  done: boolean;
};

export type ProofItem = {
  label: string;
  target: string;
  status: ProofStatus;
};

export type LaunchKit = {
  id: string;
  projectId: string;
  slug: string;
  tokenName: string;
  tokenSymbol: string;
  oneLiner: string;
  narrative: string;
  audience: string;
  hooks: string[];
  feeRecipients: FeeRecipient[];
  bagsModules: BagsModule[];
  checklist: ChecklistItem[];
  proofItems: ProofItem[];
  studioNotes: string;
  builderDecision: ReviewDecision;
  builderFeedback: string;
  updatedAt: string;
  reviewUpdatedAt: string | null;
};

export type LaunchKitStore = {
  projects: CandidateProject[];
  kits: LaunchKit[];
};
