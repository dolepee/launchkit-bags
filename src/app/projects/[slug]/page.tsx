import { notFound } from "next/navigation";
import { LaunchRoom } from "@/components/launch-room";
import { getKitBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const { project, kit } = await getKitBySlug(slug);

  if (!project || !kit) {
    notFound();
  }

  return <LaunchRoom project={project} kit={kit} />;
}
