import { notFound } from "next/navigation";
import { KitEditor } from "@/components/kit-editor";
import { getKitBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function StudioKitPage({ params }: Props) {
  const { slug } = await params;
  const { project, kit } = await getKitBySlug(slug);

  if (!project || !kit) {
    notFound();
  }

  return <KitEditor project={project} kit={kit} />;
}
