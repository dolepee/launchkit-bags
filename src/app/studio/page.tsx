import { StudioDashboard } from "@/components/studio-dashboard";
import { loadDashboard } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const { projects, kits } = await loadDashboard();
  return <StudioDashboard projects={projects} kits={kits} />;
}
