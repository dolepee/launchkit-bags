import { BagsModule, FeeRecipient } from "@/lib/types";

export const APPLICATION_TRACKS = [
  "Bags API",
  "Fee Sharing",
  "AI Agents",
  "Claude Skills",
  "DeFi",
  "Payments",
  "Privacy",
  "Social Finance",
  "Other",
] as const;

export const CONTACT_CHANNELS = ["X DM", "Telegram", "Discord", "Email", "Farcaster", "Other"] as const;

export type ApplicationTrack = (typeof APPLICATION_TRACKS)[number];
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export type BuilderApplicationInput = {
  projectName: string;
  builderName: string;
  contactHandle: string;
  contactChannel: ContactChannel;
  projectUrl?: string;
  verifiedProfileUrl: string;
  summary: string;
  whyBags: string;
  tractionSummary?: string;
  audience?: string;
  track: ApplicationTrack;
  tokenName?: string;
  tokenSymbol?: string;
};

export function isApplicationTrack(value: string): value is ApplicationTrack {
  return APPLICATION_TRACKS.includes(value as ApplicationTrack);
}

export function isContactChannel(value: string): value is ContactChannel {
  return CONTACT_CHANNELS.includes(value as ContactChannel);
}

export function cleanField(value?: string | null): string {
  return value?.trim() ?? "";
}

export function deriveTokenSymbol(projectName: string, preferred?: string): string {
  const explicit = preferred?.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (explicit) {
    return explicit.slice(0, 10);
  }

  const initials = projectName
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, ""))
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (initials.length >= 3) {
    return initials.slice(0, 10);
  }

  const condensed = projectName.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (condensed.length >= 3) {
    return condensed.slice(0, 10);
  }

  return "BAGS";
}

export function buildApplicationHooks(input: Pick<BuilderApplicationInput, "track" | "whyBags" | "tractionSummary">): string[] {
  const hooks = [
    `Launch under the ${input.track} track with a builder-owned Bags integration.`,
    sentenceCase(input.whyBags),
  ];

  const traction = cleanField(input.tractionSummary);
  if (traction) {
    hooks.push(`Current traction signal: ${sentenceCase(traction)}`);
  } else {
    hooks.push("Use the first Bags launch to turn early users into a visible traction signal.");
  }

  return hooks.slice(0, 3);
}

export function buildApplicationFeeRecipients(contactHandle: string): FeeRecipient[] {
  return [
    {
      role: "Builder",
      share: 80,
      handle: contactHandle,
      reason: "Keeps the builder economically dominant while the product is finding product-market fit.",
    },
    {
      role: "Growth operator",
      share: 10,
      handle: "@launchkit",
      reason: "Rewards the operator responsible for turning approval into actual launch activity.",
    },
    {
      role: "Community reserve",
      share: 10,
      handle: "TBD",
      reason: "Leaves room for the first partner, moderator, or distribution contributor.",
    },
  ];
}

export function buildApplicationModules(track: ApplicationTrack): BagsModule[] {
  return [
    {
      key: "token",
      label: "Token launch scaffold",
      status: "configured",
      note: `${track} application captured. Token brief is ready for builder review and Bags token-info generation.`,
    },
    {
      key: "fee-sharing",
      label: "Fee-sharing plan",
      status: "planned",
      note: "Default split is drafted and should be validated with the builder before launch.",
    },
    {
      key: "partner-loop",
      label: "Partner growth loop",
      status: "planned",
      note: "Reserved for the first contributor, partner, or referral loop once the builder opts in.",
    },
    {
      key: "trade-room",
      label: "Launch room preview",
      status: "ready",
      note: "Public launch room is available immediately for review, proof, and distribution.",
    },
  ];
}

export function scoreApplication(input: BuilderApplicationInput): number {
  let score = 68;

  if (cleanField(input.projectUrl)) score += 6;
  if (cleanField(input.verifiedProfileUrl)) score += 8;
  if (cleanField(input.tractionSummary)) score += 8;
  if (cleanField(input.tokenName) || cleanField(input.tokenSymbol)) score += 4;
  if (input.track === "Bags API" || input.track === "Fee Sharing") score += 6;

  return Math.min(score, 96);
}

function sentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
}
