import fs from "node:fs/promises";
import path from "node:path";

export async function readJsonFile<T>(target: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(target, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(target: string, payload: unknown): Promise<void> {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
