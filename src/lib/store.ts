import path from "node:path";
import {
  BuilderApplicationInput,
  buildApplicationFeeRecipients,
  buildApplicationHooks,
  buildApplicationModules,
  cleanField,
  deriveTokenSymbol,
  scoreApplication,
} from "@/lib/application";
import { getDataDir } from "@/lib/paths";
import { readJsonFile, writeJsonFile } from "@/lib/fs-utils";
import { CandidateProject, LaunchKit, LaunchKitStore, ProjectStage, ReviewDecision } from "@/lib/types";

const storeFile = path.join(getDataDir(), "launchkit-store.json");
const bundledSeedFile = path.join(process.cwd(), "data", "launchkit-store.json");

const emptyStore: LaunchKitStore = {
  projects: [],
  kits: [],
};

function isLaunchKitStore(value: unknown): value is LaunchKitStore {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<LaunchKitStore>;
  return Array.isArray(candidate.projects) && Array.isArray(candidate.kits);
}

function sortByTouch<T extends { updatedAt?: string; lastTouch?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const left = a.updatedAt ?? a.lastTouch ?? "";
    const right = b.updatedAt ?? b.lastTouch ?? "";
    return right.localeCompare(left);
  });
}

function deriveStage(decision: ReviewDecision, current: ProjectStage): ProjectStage {
  if (decision === "approved") return current === "launched" ? "launched" : "approved";
  if (decision === "needs-edits") return "review";
  if (decision === "rejected") return "drafting";
  return current;
}

function slugify(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "launchkit";
}

function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) {
    return base;
  }

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
}

function makeId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

function contactUrl(channel: BuilderApplicationInput["contactChannel"], handle: string): string {
  const trimmed = cleanField(handle);
  if (!trimmed) {
    return "";
  }

  const normalized = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
  if (channel === "X DM") {
    return `https://x.com/${normalized}`;
  }
  if (channel === "Telegram") {
    return `https://t.me/${normalized}`;
  }

  return "";
}

function buildStudioNotes(input: BuilderApplicationInput): string {
  const notes = [
    "Inbound builder application from the public /apply flow.",
    `Why Bags: ${cleanField(input.whyBags)}`,
  ];

  const traction = cleanField(input.tractionSummary);
  if (traction) {
    notes.push(`Current traction: ${traction}`);
  }

  const verifiedProfile = cleanField(input.verifiedProfileUrl);
  if (verifiedProfile) {
    notes.push(`Verified profile: ${verifiedProfile}`);
  }

  return notes.join("\n\n");
}

function buildTokenDescription(summary: string, whyBags: string): string {
  return `${summary.trim()} ${whyBags.trim()}`.trim().slice(0, 1000);
}

export async function loadStore(): Promise<LaunchKitStore> {
  const existing = await readJsonFile<unknown>(storeFile, null);
  if (isLaunchKitStore(existing)) {
    return existing;
  }

  if (storeFile !== bundledSeedFile) {
    const seeded = await readJsonFile<unknown>(bundledSeedFile, emptyStore);
    if (isLaunchKitStore(seeded)) {
      await writeJsonFile(storeFile, seeded);
      return seeded;
    }
  }

  await writeJsonFile(storeFile, emptyStore);
  return emptyStore;
}

export async function saveStore(store: LaunchKitStore): Promise<void> {
  await writeJsonFile(storeFile, store);
}

export async function loadDashboard() {
  const store = await loadStore();
  return {
    projects: sortByTouch(store.projects),
    kits: sortByTouch(store.kits),
  };
}

export async function getKitBySlug(slug: string): Promise<{ project: CandidateProject | null; kit: LaunchKit | null }> {
  const store = await loadStore();
  const kit = store.kits.find((entry) => entry.slug === slug) ?? null;
  if (!kit) {
    return { project: null, kit: null };
  }

  const project = store.projects.find((entry) => entry.id === kit.projectId) ?? null;
  return { project, kit };
}

export async function updateKit(
  slug: string,
  updater: (kit: LaunchKit, project: CandidateProject | null) => { kit: LaunchKit; projectStage?: ProjectStage },
): Promise<{ kit: LaunchKit; project: CandidateProject | null } | null> {
  const store = await loadStore();
  const kitIndex = store.kits.findIndex((entry) => entry.slug === slug);
  if (kitIndex === -1) {
    return null;
  }

  const currentKit = store.kits[kitIndex];
  const projectIndex = store.projects.findIndex((entry) => entry.id === currentKit.projectId);
  const currentProject = projectIndex === -1 ? null : store.projects[projectIndex];
  const result = updater(currentKit, currentProject);

  store.kits[kitIndex] = result.kit;

  if (currentProject && projectIndex !== -1) {
    store.projects[projectIndex] = {
      ...currentProject,
      status: result.projectStage ?? deriveStage(result.kit.builderDecision, currentProject.status),
      lastTouch: result.kit.updatedAt,
    };
  }

  await saveStore(store);
  return {
    kit: store.kits[kitIndex],
    project: projectIndex === -1 ? null : store.projects[projectIndex],
  };
}

export async function createApplication(input: BuilderApplicationInput): Promise<{ project: CandidateProject; kit: LaunchKit }> {
  const store = await loadStore();
  const takenSlugs = new Set([...store.projects.map((project) => project.slug), ...store.kits.map((kit) => kit.slug)]);
  const projectSlug = uniqueSlug(slugify(input.projectName), takenSlugs);
  takenSlugs.add(projectSlug);
  const kitSlug = uniqueSlug(`${projectSlug}-launch-kit`, takenSlugs);
  const updatedAt = new Date().toISOString();
  const fitScore = scoreApplication(input);
  const projectUrl = cleanField(input.projectUrl);
  const verifiedProfileUrl = cleanField(input.verifiedProfileUrl);
  const tractionSummary = cleanField(input.tractionSummary);
  const tokenName = cleanField(input.tokenName) || `${input.projectName.trim()} Access`;
  const tokenSymbol = deriveTokenSymbol(input.projectName, input.tokenSymbol);
  const contactDestination = contactUrl(input.contactChannel, input.contactHandle);

  const project: CandidateProject = {
    id: makeId("proj"),
    slug: projectSlug,
    name: input.projectName.trim(),
    sector: input.track,
    builderName: input.builderName.trim(),
    contactHandle: input.contactHandle.trim(),
    contactChannel: input.contactChannel,
    fitScore,
    priority: fitScore >= 82 ? "high" : "medium",
    status: "review",
    summary: input.summary.trim(),
    lastTouch: updatedAt,
    projectUrl: projectUrl || undefined,
    verifiedProfileUrl: verifiedProfileUrl || undefined,
    tractionSummary: tractionSummary || undefined,
    source: "builder-apply",
  };

  const kit: LaunchKit = {
    id: makeId("kit"),
    projectId: project.id,
    slug: kitSlug,
    tokenName,
    tokenSymbol,
    tokenDescription: buildTokenDescription(input.summary, input.whyBags),
    oneLiner: input.summary.trim(),
    narrative: input.whyBags.trim(),
    audience: cleanField(input.audience) || tractionSummary || `Early Bags-aligned users for ${input.projectName.trim()}.`,
    hooks: buildApplicationHooks(input),
    feeRecipients: buildApplicationFeeRecipients(input.contactHandle.trim()),
    bagsModules: buildApplicationModules(input.track),
    bagsTokenInfo: {
      status: "draft",
      imageUrl: `https://placehold.co/1200x1200/png?text=${encodeURIComponent(tokenSymbol)}`,
      website: projectUrl,
      twitter: input.contactChannel === "X DM" ? contactDestination : "",
      telegram: input.contactChannel === "Telegram" ? contactDestination : "",
      metadataUrl: "",
      tokenMint: null,
      tokenMetadata: null,
      launchWallet: null,
      launchSignature: null,
      uri: null,
      generatedAt: null,
      lastError: null,
    },
    checklist: [
      {
        label: "Validate builder application details",
        done: true,
      },
      {
        label: "Approve fee-sharing story",
        done: false,
      },
      {
        label: "Generate Bags token info",
        done: false,
      },
      {
        label: "Share public launch room",
        done: false,
      },
    ],
    proofItems: [
      {
        label: "Builder response",
        target: "same-day follow-up",
        status: "in-progress",
      },
      {
        label: "Bags token artifact",
        target: "generated",
        status: "queued",
      },
      {
        label: "Public launch room share",
        target: "1 distribution push",
        status: "queued",
      },
    ],
    studioNotes: buildStudioNotes(input),
    builderDecision: null,
    builderFeedback: "",
    updatedAt,
    reviewUpdatedAt: null,
  };

  store.projects.push(project);
  store.kits.push(kit);
  await saveStore(store);

  return { project, kit };
}
