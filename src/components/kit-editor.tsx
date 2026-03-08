"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CandidateProject, LaunchKit, ProjectStage } from "@/lib/types";

type Props = {
  project: CandidateProject;
  kit: LaunchKit;
};

type SaveState = "idle" | "saved" | "error";

export function KitEditor({ project, kit }: Props) {
  const [form, setForm] = useState({
    tokenName: kit.tokenName,
    tokenSymbol: kit.tokenSymbol,
    oneLiner: kit.oneLiner,
    narrative: kit.narrative,
    audience: kit.audience,
    studioNotes: kit.studioNotes,
    projectStage: project.status,
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setSaveState("idle");
  }

  function save() {
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

            <div className="actionCluster">
              <button className="buttonPrimary" type="button" disabled={isPending} onClick={save}>
                {isPending ? "Saving..." : "Save brief"}
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
  if (status === "ready" || status === "approved" || status === "launched") return "tonePill toneGood";
  if (status === "configured" || status === "review") return "tonePill toneWarm";
  return "tonePill toneMuted";
}
