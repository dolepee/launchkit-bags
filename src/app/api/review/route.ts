import { NextRequest, NextResponse } from "next/server";
import { updateKit } from "@/lib/store";

type Body = {
  slug?: string;
  decision?: "approved" | "needs-edits" | "rejected";
  feedback?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Body;
  if (!body.slug || !body.decision) {
    return NextResponse.json({ ok: false, error: "slug and decision are required" }, { status: 400 });
  }

  const decision = body.decision;
  const updatedAt = new Date().toISOString();
  const result = await updateKit(body.slug, (kit) => ({
    kit: {
      ...kit,
      builderDecision: decision,
      builderFeedback: body.feedback?.trim() ?? "",
      updatedAt,
      reviewUpdatedAt: updatedAt,
    },
  }));

  if (!result) {
    return NextResponse.json({ ok: false, error: "kit not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, kit: result.kit, project: result.project });
}
