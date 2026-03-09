"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { APPLICATION_TRACKS, CONTACT_CHANNELS, ApplicationTrack, ContactChannel } from "@/lib/application";

type SuccessState = {
  reviewUrl: string;
  launchRoomUrl: string;
  studioUrl: string;
};

export function BuilderApplicationForm() {
  const [form, setForm] = useState<{
    projectName: string;
    builderName: string;
    contactHandle: string;
    contactChannel: ContactChannel;
    projectUrl: string;
    verifiedProfileUrl: string;
    summary: string;
    whyBags: string;
    tractionSummary: string;
    audience: string;
    track: ApplicationTrack;
    tokenName: string;
    tokenSymbol: string;
  }>({
    projectName: "",
    builderName: "",
    contactHandle: "",
    contactChannel: CONTACT_CHANNELS[0],
    projectUrl: "",
    verifiedProfileUrl: "",
    summary: "",
    whyBags: "",
    tractionSummary: "",
    audience: "",
    track: APPLICATION_TRACKS[0],
    tokenName: "",
    tokenSymbol: "",
  });
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  function submit() {
    setError(null);
    setSuccess(null);

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/applications", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(form),
          });
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
            reviewUrl?: string;
            launchRoomUrl?: string;
            studioUrl?: string;
          };

          if (!response.ok || !payload.reviewUrl || !payload.launchRoomUrl || !payload.studioUrl) {
            throw new Error(payload.error ?? "application_failed");
          }

          setSuccess({
            reviewUrl: payload.reviewUrl,
            launchRoomUrl: payload.launchRoomUrl,
            studioUrl: payload.studioUrl,
          });
        } catch (submitError) {
          setError(submitError instanceof Error ? submitError.message : "Could not create your launch kit.");
        }
      })();
    });
  }

  return (
    <section className="paperBlock">
      <div className="sectionHeader">
        <div>
          <span className="eyebrow">Apply</span>
          <h2>Start a live Bags launch kit</h2>
        </div>
      </div>

      <div className="fieldGrid">
        <label>
          Project name
          <input value={form.projectName} onChange={(event) => updateField("projectName", event.target.value)} />
        </label>
        <label>
          Builder name
          <input value={form.builderName} onChange={(event) => updateField("builderName", event.target.value)} />
        </label>
        <label>
          Track
          <select value={form.track} onChange={(event) => updateField("track", event.target.value as ApplicationTrack)}>
            {APPLICATION_TRACKS.map((track) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="fieldGrid">
        <label>
          Contact handle
          <input value={form.contactHandle} onChange={(event) => updateField("contactHandle", event.target.value)} placeholder="@yourhandle" />
        </label>
        <label>
          Contact channel
          <select value={form.contactChannel} onChange={(event) => updateField("contactChannel", event.target.value as ContactChannel)}>
            {CONTACT_CHANNELS.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        </label>
        <label>
          Project URL
          <input value={form.projectUrl} onChange={(event) => updateField("projectUrl", event.target.value)} placeholder="https://..." />
        </label>
      </div>

      <div className="fieldGrid">
        <label>
          Verified profile URL
          <input value={form.verifiedProfileUrl} onChange={(event) => updateField("verifiedProfileUrl", event.target.value)} placeholder="https://x.com/... or verified profile" />
        </label>
        <label>
          Token name (optional)
          <input value={form.tokenName} onChange={(event) => updateField("tokenName", event.target.value)} />
        </label>
        <label>
          Token symbol (optional)
          <input value={form.tokenSymbol} onChange={(event) => updateField("tokenSymbol", event.target.value)} />
        </label>
      </div>

      <label className="stackedField">
        What are you building?
        <textarea rows={4} value={form.summary} onChange={(event) => updateField("summary", event.target.value)} />
      </label>

      <label className="stackedField">
        Why should this launch on Bags?
        <textarea rows={5} value={form.whyBags} onChange={(event) => updateField("whyBags", event.target.value)} />
      </label>

      <label className="stackedField">
        Current traction or proof of demand
        <textarea rows={4} value={form.tractionSummary} onChange={(event) => updateField("tractionSummary", event.target.value)} placeholder="Users, revenue, waitlist, GitHub stars, trading interest, or other proof." />
      </label>

      <label className="stackedField">
        Target audience
        <textarea rows={3} value={form.audience} onChange={(event) => updateField("audience", event.target.value)} placeholder="Who should care first?" />
      </label>

      <div className="actionCluster">
        <button className="buttonPrimary" type="button" disabled={isPending} onClick={submit}>
          {isPending ? "Creating launch kit..." : "Create launch kit"}
        </button>
      </div>

      {error ? <div className="messageBox errorBox">{error}</div> : null}

      {success ? (
        <div className="messageBox successBox">
          <p>Your launch kit is live. Start with the review page, then share the launch room publicly once the plan is approved.</p>
          <div className="actionCluster">
            <Link className="buttonPrimary" href={success.reviewUrl}>
              Open builder review
            </Link>
            <Link className="buttonGhost" href={success.launchRoomUrl}>
              Open launch room
            </Link>
            <Link className="buttonGhost" href={success.studioUrl}>
              Open studio brief
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
