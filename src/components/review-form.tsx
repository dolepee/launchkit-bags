"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CandidateProject, LaunchKit } from "@/lib/types";

type Props = {
  project: CandidateProject;
  kit: LaunchKit;
};

export function ReviewForm({ project, kit }: Props) {
  const [feedback, setFeedback] = useState(kit.builderFeedback);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(decision: "approved" | "needs-edits" | "rejected") {
    setMessage(null);
    setError(null);

    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch("/api/review", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              slug: kit.slug,
              decision,
              feedback,
            }),
          });
          if (!res.ok) {
            throw new Error("review_failed");
          }

          setMessage(
            decision === "approved"
              ? "Approved. The studio now reflects your decision."
              : decision === "needs-edits"
                ? "Edit request sent. The studio now reflects your notes."
                : "Rejected. The studio now reflects your decision.",
          );
          router.refresh();
        } catch {
          setError("Could not submit your response. Please try again.");
        }
      })();
    });
  }

  return (
    <section className="reviewStage">
      <div className="reviewHero">
        <div>
          <span className="eyebrow">Builder review</span>
          <h1>{project.name}</h1>
          <p>{kit.oneLiner}</p>
        </div>
        <div className="inlineList">
          <span>{kit.tokenName}</span>
          <span>{kit.tokenSymbol}</span>
          <span>{project.builderName}</span>
        </div>
      </div>

      <div className="reviewColumns">
        <div className="contentStack">
          <section className="paperBlock spotlightBlock">
            <span className="eyebrow">Why this launch exists</span>
            <p>{kit.narrative}</p>
          </section>

          <section className="paperBlock">
            <span className="eyebrow">Audience</span>
            <p>{kit.audience}</p>
          </section>

          <section className="paperBlock">
            <span className="eyebrow">Launch hooks</span>
            <ul className="checkList">
              {kit.hooks.map((hook) => (
                <li key={hook}>{hook}</li>
              ))}
            </ul>
          </section>

          <label className="stackedField">
            What should change before this goes live?
            <textarea
              rows={7}
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Tell us what language, splits, or positioning feels wrong."
            />
          </label>

          <div className="actionCluster">
            <button className="buttonPrimary" type="button" disabled={isPending} onClick={() => submit("approved")}>
              {isPending ? "Submitting..." : "Approve"}
            </button>
            <button className="buttonGhost" type="button" disabled={isPending} onClick={() => submit("needs-edits")}>
              Request edits
            </button>
            <button className="buttonDanger" type="button" disabled={isPending} onClick={() => submit("rejected")}>
              Reject
            </button>
            <Link className="buttonGhost" href={`/projects/${kit.slug}`}>
              Open launch room
            </Link>
          </div>

          {message ? <div className="messageBox successBox">{message}</div> : null}
          {error ? <div className="messageBox errorBox">{error}</div> : null}
        </div>

        <aside className="contentRail">
          <section className="paperBlock">
            <span className="eyebrow">Proposed fee sharing</span>
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
            <span className="eyebrow">Bags readiness</span>
            <div className="moduleList">
              {kit.bagsModules.map((item) => (
                <article className="moduleCard" key={item.key}>
                  <div className="rowTitle">
                    <h3>{item.label}</h3>
                    <span className={item.status === "ready" ? "tonePill toneGood" : item.status === "configured" ? "tonePill toneWarm" : "tonePill toneMuted"}>
                      {item.status}
                    </span>
                  </div>
                  <p>{item.note}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
