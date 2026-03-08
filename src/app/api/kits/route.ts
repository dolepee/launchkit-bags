import { NextRequest, NextResponse } from "next/server";
import { updateKit } from "@/lib/store";
import { ProjectStage } from "@/lib/types";

type Body = {
  slug?: string;
  tokenName?: string;
  tokenSymbol?: string;
  oneLiner?: string;
  narrative?: string;
  audience?: string;
  studioNotes?: string;
  projectStage?: ProjectStage;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Body;
  if (!body.slug) {
    return NextResponse.json({ ok: false, error: "slug is required" }, { status: 400 });
  }

  const updatedAt = new Date().toISOString();
  const result = await updateKit(body.slug, (kit) => ({
    kit: {
      ...kit,
      tokenName: body.tokenName ?? kit.tokenName,
      tokenSymbol: body.tokenSymbol ?? kit.tokenSymbol,
      oneLiner: body.oneLiner ?? kit.oneLiner,
      narrative: body.narrative ?? kit.narrative,
      audience: body.audience ?? kit.audience,
      studioNotes: body.studioNotes ?? kit.studioNotes,
      updatedAt,
    },
    projectStage: body.projectStage,
  }));

  if (!result) {
    return NextResponse.json({ ok: false, error: "kit not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, kit: result.kit, project: result.project });
}
