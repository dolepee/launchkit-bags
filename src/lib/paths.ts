import path from "node:path";

export function getDataDir(): string {
  return path.join(process.cwd(), "data");
}
