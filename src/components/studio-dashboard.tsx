import Link from "next/link";
import { CandidateProject, LaunchKit } from "@/lib/types";

type Props = {
  projects: CandidateProject[];
  kits: LaunchKit[];
};

function statusClass(status: string) {
  if (status === "approved" || status === "launch-ready" || status === "launched") return "tonePill toneGood";
  if (status === "review" || status === "needs-edits") return "tonePill toneWarm";
  return "tonePill toneMuted";
}

function liveArtifactCount(kits: LaunchKit[]) {
  return kits.filter((kit) => kit.bagsTokenInfo.status === "generated").length;
}

export function StudioDashboard({ projects, kits }: Props) {
  const approved = kits.filter((kit) => kit.builderDecision === "approved").length;
  const queuedReviews = kits.filter((kit) => kit.builderDecision === null).length;
  const featuredKit = kits[0] ?? null;

  return (
    <section className="studioLayout">
      <div className="heroBand">
        <div className="heroCopy">
          <span className="eyebrow">Operator Studio</span>
          <h1>Use Bags like a launch system, not just a token button.</h1>
          <p>
            This studio is built to move real builders from outreach to approved launch kits. The first job is not analytics. The first
            job is getting a builder to say yes to a concrete launch plan.
          </p>
        </div>

        <div className="metricGrid">
          <article className="metricCard">
            <span className="metricValue">{projects.length}</span>
            <span className="metricLabel">Tracked builders</span>
          </article>
          <article className="metricCard">
            <span className="metricValue">{queuedReviews}</span>
            <span className="metricLabel">Pending reviews</span>
          </article>
          <article className="metricCard">
            <span className="metricValue">{approved}</span>
            <span className="metricLabel">Approved kits</span>
          </article>
          <article className="metricCard">
            <span className="metricValue">{liveArtifactCount(kits)}</span>
            <span className="metricLabel">Live Bags artifacts</span>
          </article>
        </div>
      </div>

      <div className="studioColumns">
        <div className="contentStack">
          <section className="paperBlock">
            <div className="sectionHeader">
              <div>
                <span className="eyebrow">Queue</span>
                <h2>Active launch kits</h2>
              </div>
              {featuredKit ? (
                <Link className="buttonPrimary" href={`/studio/kits/${featuredKit.slug}`}>
                  Open current priority
                </Link>
              ) : null}
            </div>

            <div className="rowsTable">
              {kits.map((kit) => {
                const project = projects.find((entry) => entry.id === kit.projectId);
                return (
                  <article className="rowCard" key={kit.id}>
                    <div className="rowMain">
                      <div className="rowTitle">
                        <h3>{project?.name ?? kit.tokenName}</h3>
                        <span className={statusClass(project?.status ?? "drafting")}>{project?.status ?? "drafting"}</span>
                      </div>
                      <p>{kit.oneLiner}</p>
                      <div className="inlineList">
                        <span>{kit.tokenName}</span>
                        <span>{kit.tokenSymbol}</span>
                        <span>{project?.sector ?? "general"}</span>
                        <span>{project?.contactHandle ?? "unknown contact"}</span>
                      </div>
                    </div>
                    <div className="rowActions">
                      <Link className="buttonGhost" href={`/studio/kits/${kit.slug}`}>
                        Edit brief
                      </Link>
                      <Link className="buttonGhost" href={`/review/${kit.slug}`}>
                        Builder review
                      </Link>
                      <Link className="buttonGhost" href={`/projects/${kit.slug}`}>
                        Launch room
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="paperBlock">
            <div className="sectionHeader">
              <div>
                <span className="eyebrow">Pipeline</span>
                <h2>Builder targets</h2>
              </div>
            </div>

            <div className="projectGrid">
              {projects.map((project) => (
                <article className="projectCard" key={project.id}>
                  <div className="rowTitle">
                    <h3>{project.name}</h3>
                    <span className={statusClass(project.status)}>{project.status}</span>
                  </div>
                  <p>{project.summary}</p>
                  <div className="projectMeta">
                    <span>{project.builderName}</span>
                    <span>{project.contactChannel}</span>
                    <span>Fit score {project.fitScore}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="contentRail">
          <section className="paperBlock accentBlock">
            <span className="eyebrow">Rule</span>
            <h2>Do not wait for the perfect dashboard.</h2>
            <p>
              Day 4 outreach happens in parallel with Bags integration. The approval loop is the real product wedge because it puts a
              concrete plan in front of a builder immediately.
            </p>
          </section>

          <section className="paperBlock">
            <span className="eyebrow">Proof standard</span>
            <ul className="checkList">
              <li>10 to 20 sourced builders</li>
              <li>3 or more approved kits</li>
              <li>2 or more real launches if possible</li>
              <li>Public proof once tracking lands</li>
            </ul>
          </section>

          <section className="paperBlock">
            <span className="eyebrow">Why this fits Bags</span>
            <ul className="checkList">
              <li>Turns launch planning into token, fee-share, and proof surfaces.</li>
              <li>Creates a direct path from builder approval to onchain action.</li>
              <li>Gives judges a clear narrative plus verifiable launch artifacts.</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
