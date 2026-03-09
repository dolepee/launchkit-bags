import { NextRequest, NextResponse } from "next/server";
import { buildTokenInfoInput, createBagsTokenInfo, getLaunchKitOperatorKey, validateKitForTokenInfo } from "@/lib/bags";
import { normalizeBagsMetadata } from "@/lib/bags-metadata";
import { getKitBySlug, updateKit } from "@/lib/store";

type Body = {
  slug?: string;
};

export async function POST(request: NextRequest) {
  const operatorKey = getLaunchKitOperatorKey();
  if (!operatorKey) {
    return NextResponse.json({ ok: false, error: "Missing LAUNCHKIT_OPERATOR_KEY." }, { status: 503 });
  }

  const suppliedOperatorKey = request.headers.get("x-launchkit-operator-key")?.trim();
  if (!suppliedOperatorKey || suppliedOperatorKey !== operatorKey) {
    return NextResponse.json({ ok: false, error: "Invalid operator key." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  if (!body.slug) {
    return NextResponse.json({ ok: false, error: "slug is required" }, { status: 400 });
  }

  const lookup = await getKitBySlug(body.slug);
  if (!lookup.kit || !lookup.project) {
    return NextResponse.json({ ok: false, error: "kit not found" }, { status: 404 });
  }

  if (lookup.kit.builderDecision !== "approved") {
    return NextResponse.json({ ok: false, error: "Builder approval is required before generating Bags token info." }, { status: 409 });
  }

  const validationError = validateKitForTokenInfo(lookup.kit);
  if (validationError) {
    return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
  }

  const result = await createBagsTokenInfo(buildTokenInfoInput(lookup.kit));
  if (!result.success) {
    await updateKit(body.slug, (kit) => ({
      kit: {
        ...kit,
        bagsTokenInfo: {
          ...kit.bagsTokenInfo,
          status: "failed",
          lastError: result.error ?? "Unknown Bags error.",
        },
        updatedAt: new Date().toISOString(),
      },
    }));

    return NextResponse.json({ ok: false, error: result.error ?? "Bags token info generation failed." }, { status: 502 });
  }

  const createdAt = result.response.tokenLaunch.createdAt ?? new Date().toISOString();
  const metadata = normalizeBagsMetadata(result.response.tokenMetadata, result.response.tokenLaunch.uri ?? null);
  const persisted = await updateKit(body.slug, (kit, project) => ({
    kit: {
      ...kit,
      tokenName: result.response.tokenLaunch.name,
      tokenSymbol: result.response.tokenLaunch.symbol,
      tokenDescription: result.response.tokenLaunch.description,
      bagsTokenInfo: {
        ...kit.bagsTokenInfo,
        status: "generated",
        tokenMint: result.response.tokenMint,
        tokenMetadata: metadata.tokenMetadata,
        launchWallet: result.response.tokenLaunch.launchWallet ?? null,
        launchSignature: result.response.tokenLaunch.launchSignature ?? null,
        uri: metadata.uri,
        generatedAt: createdAt,
        lastError: null,
      },
      bagsModules: kit.bagsModules.map((module) =>
        module.key === "token"
          ? {
              ...module,
              status: "ready",
              note: `Bags token info generated for mint ${shortKey(result.response.tokenMint)}.`,
            }
          : module,
      ),
      checklist: kit.checklist.map((item) =>
        item.label === "Confirm token name and ticker" || item.label === "Approve fee-sharing story"
          ? { ...item, done: true }
          : item,
      ),
      updatedAt: createdAt,
    },
    projectStage: project?.status === "launched" ? "launched" : "launch-ready",
  }));

  return NextResponse.json({
    ok: true,
    kit: persisted?.kit ?? lookup.kit,
    project: persisted?.project ?? lookup.project,
    bags: result.response,
  });
}

function shortKey(value: string): string {
  if (value.length <= 10) return value;
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
