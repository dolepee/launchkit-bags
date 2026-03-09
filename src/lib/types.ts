export type ProjectStage = "sourced" | "drafting" | "review" | "approved" | "launch-ready" | "launched";

export type ReviewDecision = "approved" | "needs-edits" | "rejected" | null;

export type BagsStatus = "planned" | "configured" | "ready";

export type ProofStatus = "queued" | "in-progress" | "done";

export type BagsTokenInfoState = "draft" | "generated" | "failed";

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
  projectUrl?: string;
  verifiedProfileUrl?: string;
  tractionSummary?: string;
  source?: "seeded" | "builder-apply" | "operator";
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

export type BagsTokenInfo = {
  status: BagsTokenInfoState;
  imageUrl: string;
  website: string;
  twitter: string;
  telegram: string;
  metadataUrl: string;
  tokenMint: string | null;
  tokenMetadata: string | null;
  launchWallet: string | null;
  launchSignature: string | null;
  uri: string | null;
  generatedAt: string | null;
  lastError: string | null;
};

export type LaunchKit = {
  id: string;
  projectId: string;
  slug: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDescription: string;
  oneLiner: string;
  narrative: string;
  audience: string;
  hooks: string[];
  feeRecipients: FeeRecipient[];
  bagsModules: BagsModule[];
  bagsTokenInfo: BagsTokenInfo;
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
