import { NextRequest, NextResponse } from "next/server";
import { BuilderApplicationInput, isApplicationTrack, isContactChannel } from "@/lib/application";
import { createApplication } from "@/lib/store";

type Body = {
  projectName?: string;
  builderName?: string;
  contactHandle?: string;
  contactChannel?: string;
  projectUrl?: string;
  verifiedProfileUrl?: string;
  summary?: string;
  whyBags?: string;
  tractionSummary?: string;
  audience?: string;
  track?: string;
  tokenName?: string;
  tokenSymbol?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Body;

  if (!body.projectName?.trim()) {
    return NextResponse.json({ ok: false, error: "projectName is required" }, { status: 400 });
  }
  if (!body.builderName?.trim()) {
    return NextResponse.json({ ok: false, error: "builderName is required" }, { status: 400 });
  }
  if (!body.contactHandle?.trim()) {
    return NextResponse.json({ ok: false, error: "contactHandle is required" }, { status: 400 });
  }
  if (!body.contactChannel || !isContactChannel(body.contactChannel)) {
    return NextResponse.json({ ok: false, error: "contactChannel is invalid" }, { status: 400 });
  }
  if (!body.verifiedProfileUrl?.trim()) {
    return NextResponse.json({ ok: false, error: "verifiedProfileUrl is required" }, { status: 400 });
  }
  if (!body.summary?.trim()) {
    return NextResponse.json({ ok: false, error: "summary is required" }, { status: 400 });
  }
  if (!body.whyBags?.trim()) {
    return NextResponse.json({ ok: false, error: "whyBags is required" }, { status: 400 });
  }
  if (!body.track || !isApplicationTrack(body.track)) {
    return NextResponse.json({ ok: false, error: "track is invalid" }, { status: 400 });
  }

  const input: BuilderApplicationInput = {
    projectName: body.projectName.trim(),
    builderName: body.builderName.trim(),
    contactHandle: body.contactHandle.trim(),
    contactChannel: body.contactChannel,
    projectUrl: body.projectUrl?.trim(),
    verifiedProfileUrl: body.verifiedProfileUrl.trim(),
    summary: body.summary.trim(),
    whyBags: body.whyBags.trim(),
    tractionSummary: body.tractionSummary?.trim(),
    audience: body.audience?.trim(),
    track: body.track,
    tokenName: body.tokenName?.trim(),
    tokenSymbol: body.tokenSymbol?.trim(),
  };

  const result = await createApplication(input);

  return NextResponse.json({
    ok: true,
    project: result.project,
    kit: result.kit,
    reviewUrl: `/review/${result.kit.slug}`,
    launchRoomUrl: `/projects/${result.kit.slug}`,
    studioUrl: `/studio/kits/${result.kit.slug}`,
  });
}
