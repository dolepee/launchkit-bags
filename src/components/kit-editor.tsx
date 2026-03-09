"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { normalizeBagsMetadata } from "@/lib/bags-metadata";
import { CandidateProject, LaunchKit, ProjectStage } from "@/lib/types";

type Props = {
  project: CandidateProject;
  kit: LaunchKit;
};

type SaveState = "idle" | "saved" | "error";

export function KitEditor({ project, kit }: Props) {
  const metadata = normalizeBagsMetadata(kit.bagsTokenInfo.tokenMetadata, kit.bagsTokenInfo.uri);
  const [form, setForm] = useState({
    tokenName: kit.tokenName,
    tokenSymbol: kit.tokenSymbol,
    tokenDescription: kit.tokenDescription,
    oneLiner: kit.oneLiner,
    narrative: kit.narrative,
    audience: kit.audience,
    studioNotes: kit.studioNotes,
    imageUrl: kit.bagsTokenInfo.imageUrl,
    website: kit.bagsTokenInfo.website,
    twitter: kit.bagsTokenInfo.twitter,
    telegram: kit.bagsTokenInfo.telegram,
    metadataUrl: kit.bagsTokenInfo.metadataUrl,
    projectStage: project.status,
  });
  const [operatorKey, setOperatorKey] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [bagsState, setBagsState] = useState<SaveState>("idle");
  const [bagsMessage, setBagsMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<"save" | "bags" | null>(null);
  const router = useRouter();

  function updateField<K extends keyof typeof form>(name: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [name]: value }));
    setSaveState("idle");
  }

  function save() {
    setPendingAction("save");
    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/kits", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              slug: kit.slug,
              ...form,
            }),
          });
          if (!res.ok) {
            throw new Error("save_failed");
          }
          setSaveState("saved");
          router.refresh();
        } catch {
          setSaveState("error");
        } finally {
          setPendingAction(null);
        }
      })();
    });
  }

  function generateBagsTokenInfo() {
    setBagsState("idle");
    setBagsMessage(null);

    if (!operatorKey.trim()) {
      setBagsState("error");
      setBagsMessage("Enter the operator key before generating a Bags token draft.");
      return;
    }

    setPendingAction("bags");
    startTransition(() => {
      void (async () => {
        try {
          const saveRes = await fetch("/api/kits", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              slug: kit.slug,
              ...form,
            }),
          });
          if (!saveRes.ok) {
            throw new Error("save_before_bags_failed");
          }

          const res = await fetch("/api/bags/token-info", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-launchkit-operator-key": operatorKey.trim(),
            },
            body: JSON.stringify({
              slug: kit.slug,
            }),
          });

          const payload = (await res.json().catch(() => ({}))) as { error?: string };
          if (!res.ok) {
            throw new Error(payload.error ?? "bags_token_info_failed");
          }

          setBagsState("saved");
          setBagsMessage("Bags token metadata generated and saved to this launch kit.");
          router.refresh();
        } catch (error) {
          setBagsState("error");
          setBagsMessage(error instanceof Error ? error.message : "Could not generate Bags token metadata.");
        } finally {
          setPendingAction(null);
        }
      })();
    });
  }

  return (
    <section className="studioLayout">
      <div className="heroBand compactBand">
        <div className="heroCopy">
          <span className="eyebrow">Kit Editor</span>
          <h1>{project.name}</h1>
          <p>{project.summary}</p>
        </div>

        <div className="actionCluster">
          <Link className="buttonGhost" href="/studio">
            Back to studio
          </Link>
          <Link className="buttonGhost" href={`/review/${kit.slug}`}>
            Builder review
          </Link>
          <Link className="buttonGhost" href={`/projects/${kit.slug}`}>
            Launch room
          </Link>
        </div>
      </div>

      <div className="studioColumns">
        <div className="contentStack">
          <section className="paperBlock">
            <div className="fieldGrid">
              <label>
                Token name
                <input value={form.tokenName} onChange={(event) => updateField("tokenName", event.target.value)} />
              </label>
              <label>
                Token symbol
                <input value={form.tokenSymbol} onChange={(event) => updateField("tokenSymbol", event.target.value)} />
              </label>
              <label>
                Metadata image URL
                <input value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} />
              </label>
              <label>
                Project stage
                <select value={form.projectStage} onChange={(event) => updateField("projectStage", event.target.value as ProjectStage)}>
                  <option value="sourced">sourced</option>
                  <option value="drafting">drafting</option>
                  <option value="review">review</option>
                  <option value="approved">approved</option>
                  <option value="launch-ready">launch-ready</option>
                  <option value="launched">launched</option>
                </select>
              </label>
            </div>

            <label className="stackedField">
              Token metadata description
              <textarea rows={4} value={form.tokenDescription} onChange={(event) => updateField("tokenDescription", event.target.value)} />
            </label>

            <label className="stackedField">
              One-line launch story
              <textarea rows={3} value={form.oneLiner} onChange={(event) => updateField("oneLiner", event.target.value)} />
            </label>

            <label className="stackedField">
              Narrative
              <textarea rows={8} value={form.narrative} onChange={(event) => updateField("narrative", event.target.value)} />
            </label>

            <label className="stackedField">
              Audience
              <textarea rows={4} value={form.audience} onChange={(event) => updateField("audience", event.target.value)} />
            </label>

            <label className="stackedField">
              Operator notes
              <textarea rows={6} value={form.studioNotes} onChange={(event) => updateField("studioNotes", event.target.value)} />
            </label>

            <section className="paperBlock">
              <span className="eyebrow">Bags token metadata</span>
              <div className="fieldGrid">
                <label>
                  Website
                  <input value={form.website} onChange={(event) => updateField("website", event.target.value)} />
                </label>
                <label>
                  X / Twitter URL
                  <input value={form.twitter} onChange={(event) => updateField("twitter", event.target.value)} />
                </label>
                <label>
                  Telegram URL
                  <input value={form.telegram} onChange={(event) => updateField("telegram", event.target.value)} />
                </label>
                <label>
                  Metadata URL override
                  <input value={form.metadataUrl} onChange={(event) => updateField("metadataUrl", event.target.value)} />
                </label>
              </div>

              <label className="stackedField">
                Operator key
                <input type="password" value={operatorKey} onChange={(event) => setOperatorKey(event.target.value)} />
              </label>

              <div className="actionCluster">
                <button
                  className="buttonPrimary"
                  type="button"
                  disabled={isPending || kit.builderDecision !== "approved"}
                  onClick={generateBagsTokenInfo}
                >
                  {pendingAction === "bags" ? "Generating..." : "Generate Bags token info"}
                </button>
                <span className={statusClass(kit.bagsTokenInfo.status)}>{kit.bagsTokenInfo.status}</span>
                <span className={statusClass(kit.builderDecision ?? "pending")}>
                  builder {kit.builderDecision ?? "pending"}
                </span>
              </div>

              {bagsMessage ? (
                <div className={bagsState === "saved" ? "messageBox successBox" : "messageBox errorBox"}>{bagsMessage}</div>
              ) : null}

              {kit.builderDecision !== "approved" ? (
                <div className="messageBox errorBox">Approve the builder review first. Bags token info generation is locked until the kit is approved.</div>
              ) : null}

              {kit.bagsTokenInfo.tokenMint ? (
                <div className="moduleList">
                  <article className="moduleCard">
                    <div className="rowTitle">
                      <h3>Token mint</h3>
                      <span className="tonePill toneGood">generated</span>
                    </div>
                    <p>{kit.bagsTokenInfo.tokenMint}</p>
                  </article>
                  {metadata.uri ? (
                    <article className="moduleCard">
                      <div className="rowTitle">
                        <h3>Metadata URI</h3>
                        <span className="tonePill toneGood">ready</span>
                      </div>
                      <p>{metadata.uri}</p>
                    </article>
                  ) : null}
                  {metadata.tokenMetadata ? (
                    <article className="moduleCard">
                      <div className="rowTitle">
                        <h3>Metadata account</h3>
                        <span className="tonePill toneGood">ready</span>
                      </div>
                      <p>{metadata.tokenMetadata}</p>
                    </article>
                  ) : null}
                </div>
              ) : null}
            </section>

            <div className="actionCluster">
              <button className="buttonPrimary" type="button" disabled={isPending} onClick={save}>
                {pendingAction === "save" ? "Saving..." : "Save brief"}
              </button>
              {saveState === "saved" ? <span className="tonePill toneGood">saved</span> : null}
              {saveState === "error" ? <span className="tonePill toneBad">save failed</span> : null}
            </div>
          </section>
        </div>

        <aside className="contentRail">
          <section className="paperBlock">
            <span className="eyebrow">Bags modules</span>
            <div className="moduleList">
              {kit.bagsModules.map((module) => (
                <article className="moduleCard" key={module.key}>
                  <div className="rowTitle">
                    <h3>{module.label}</h3>
                    <span className={statusClass(module.status)}>{module.status}</span>
                  </div>
                  <p>{module.note}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="paperBlock">
            <span className="eyebrow">Fee split</span>
            <div className="moduleList">
              {kit.feeRecipients.map((item) => (
                <article className="moduleCard" key={`${item.role}-${item.handle}`}>
                  <div className="rowTitle">
                    <h3>{item.role}</h3>
                    <span className="tonePill toneMuted">{item.share}%</span>
                  </div>
                  <p>{item.reason}</p>
                  <small>{item.handle}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="paperBlock">
            <span className="eyebrow">Proof plan</span>
            <ul className="checkList">
              {kit.proofItems.map((item) => (
                <li key={item.label}>
                  {item.label}: {item.target} ({item.status})
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}

function statusClass(status: string) {
  if (status === "ready" || status === "approved" || status === "launched" || status === "generated") return "tonePill toneGood";
  if (status === "failed") return "tonePill toneBad";
  if (status === "configured" || status === "review") return "tonePill toneWarm";
  return "tonePill toneMuted";
}
