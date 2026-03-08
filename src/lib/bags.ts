import { LaunchKit } from "@/lib/types";

const DEFAULT_BAGS_API_BASE_URL = "https://public-api-v2.bags.fm/api/v1";
const MAX_NAME_LENGTH = 32;
const MAX_SYMBOL_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 1000;

type BagsCreateTokenInfoSuccess = {
  success: true;
  response: {
    tokenMint: string;
    tokenMetadata: string;
    tokenLaunch: {
      name: string;
      symbol: string;
      description: string;
      image: string;
      tokenMint: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      userId: string;
      telegram?: string;
      twitter?: string;
      website?: string;
      launchWallet?: string;
      launchSignature?: string;
      uri?: string;
    };
  };
};

type BagsCreateTokenInfoFailure = {
  success: false;
  error?: string;
};

export type BagsCreateTokenInfoResponse = BagsCreateTokenInfoSuccess | BagsCreateTokenInfoFailure;

export type BagsTokenInfoInput = {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  metadataUrl?: string;
};

export function getBagsApiBaseUrl(): string {
  return (process.env.BAGS_API_BASE_URL ?? DEFAULT_BAGS_API_BASE_URL).replace(/\/+$/, "");
}

export function getBagsApiKey(): string | null {
  const key = process.env.BAGS_API_KEY?.trim();
  return key ? key : null;
}

export function getLaunchKitOperatorKey(): string | null {
  const key = process.env.LAUNCHKIT_OPERATOR_KEY?.trim();
  return key ? key : null;
}

export function validateKitForTokenInfo(kit: LaunchKit): string | null {
  if (!kit.tokenName.trim()) return "Token name is required.";
  if (kit.tokenName.trim().length > MAX_NAME_LENGTH) return "Token name must be 32 characters or fewer.";
  if (!kit.tokenSymbol.trim()) return "Token symbol is required.";
  if (kit.tokenSymbol.trim().length > MAX_SYMBOL_LENGTH) return "Token symbol must be 10 characters or fewer.";
  if (!kit.tokenDescription.trim()) return "Token description is required.";
  if (kit.tokenDescription.trim().length > MAX_DESCRIPTION_LENGTH) return "Token description must be 1000 characters or fewer.";
  if (!kit.bagsTokenInfo.imageUrl.trim()) return "A public image URL is required for Bags token metadata.";
  return null;
}

export function buildTokenInfoInput(kit: LaunchKit): BagsTokenInfoInput {
  return {
    name: kit.tokenName.trim().slice(0, MAX_NAME_LENGTH),
    symbol: kit.tokenSymbol.trim().toUpperCase().slice(0, MAX_SYMBOL_LENGTH),
    description: kit.tokenDescription.trim().slice(0, MAX_DESCRIPTION_LENGTH),
    imageUrl: kit.bagsTokenInfo.imageUrl.trim(),
    website: emptyToUndefined(kit.bagsTokenInfo.website),
    twitter: emptyToUndefined(kit.bagsTokenInfo.twitter),
    telegram: emptyToUndefined(kit.bagsTokenInfo.telegram),
    metadataUrl: emptyToUndefined(kit.bagsTokenInfo.metadataUrl),
  };
}

export async function createBagsTokenInfo(input: BagsTokenInfoInput): Promise<BagsCreateTokenInfoResponse> {
  const apiKey = getBagsApiKey();
  if (!apiKey) {
    return {
      success: false,
      error: "Missing BAGS_API_KEY.",
    };
  }

  const body = new FormData();
  body.set("name", input.name);
  body.set("symbol", input.symbol);
  body.set("description", input.description);
  body.set("imageUrl", input.imageUrl);
  if (input.website) body.set("website", input.website);
  if (input.twitter) body.set("twitter", input.twitter);
  if (input.telegram) body.set("telegram", input.telegram);
  if (input.metadataUrl) body.set("metadataUrl", input.metadataUrl);

  const response = await fetch(`${getBagsApiBaseUrl()}/token-launch/create-token-info`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
    },
    body,
    cache: "no-store",
  });

  const text = await response.text();
  const parsed = safeParseJson(text);

  if (!response.ok) {
    return {
      success: false,
      error: extractBagsError(parsed) ?? `Bags token info request failed with status ${response.status}.`,
    };
  }

  if (!parsed || typeof parsed !== "object") {
    return {
      success: false,
      error: "Bags token info response was not valid JSON.",
    };
  }

  return parsed as BagsCreateTokenInfoResponse;
}

function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function extractBagsError(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as { error?: unknown };
  return typeof candidate.error === "string" && candidate.error.trim().length > 0 ? candidate.error : null;
}

function emptyToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
