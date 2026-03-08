import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/review-form";
import { getKitBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ReviewPage({ params }: Props) {
  const { slug } = await params;
  const { project, kit } = await getKitBySlug(slug);

  if (!project || !kit) {
    notFound();
  }

  return <ReviewForm project={project} kit={kit} />;
}
