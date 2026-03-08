import path from "node:path";
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
