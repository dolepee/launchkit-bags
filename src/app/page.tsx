import Link from "next/link";
import { loadDashboard } from "@/lib/store";

export default async function HomePage() {
  const { projects, kits } = await loadDashboard();
  const featured = kits[0];

  return (
    <section className="homePage">
      <div className="heroBand homeHero">
        <div className="heroCopy">
          <span className="eyebrow">Standalone Bags app</span>
          <h1>LaunchKit is the layer between a builder conversation and a real Bags launch.</h1>
          <p>
            This is not your private operator dashboard. It is a standalone product surface for drafting Bags-native launch plans,
            putting them in front of builders, and turning approvals into something judges can verify.
          </p>
          <div className="actionCluster">
            <Link className="buttonPrimary" href="/studio">
              Open studio
            </Link>
            {featured ? (
              <Link className="buttonGhost" href={`/review/${featured.slug}`}>
                Open live builder review
              </Link>
            ) : null}
          </div>
        </div>

        <div className="spotCard">
          <span className="eyebrow">Current priority</span>
          {featured ? (
            <>
              <h2>{featured.tokenName}</h2>
              <p>{featured.oneLiner}</p>
              <div className="inlineList">
                <span>{featured.tokenSymbol}</span>
                <span>{featured.builderDecision ?? "pending review"}</span>
              </div>
            </>
          ) : (
            <p>No launch kit loaded yet.</p>
          )}
        </div>
      </div>

      <div className="projectGrid">
        <article className="projectCard">
          <span className="eyebrow">Why this can win</span>
          <p>It connects builder approval, launch economics, and Bags-native launch readiness in one place judges can understand quickly.</p>
        </article>
        <article className="projectCard">
          <span className="eyebrow">What comes first</span>
          <p>The approval loop. A builder must be able to review a concrete kit before any deeper automation matters.</p>
        </article>
        <article className="projectCard">
          <span className="eyebrow">What comes next</span>
          <p>After approval: Bags launch setup, fee-sharing configuration, public proof surfaces, and launch-room analytics.</p>
        </article>
      </div>

      <section className="paperBlock">
        <div className="sectionHeader">
          <div>
            <span className="eyebrow">Tracked builders</span>
            <h2>Pipeline snapshot</h2>
          </div>
        </div>
        <div className="projectGrid">
          {projects.map((project) => (
            <article className="projectCard" key={project.id}>
              <div className="rowTitle">
                <h3>{project.name}</h3>
                <span className={project.status === "approved" ? "tonePill toneGood" : project.status === "review" ? "tonePill toneWarm" : "tonePill toneMuted"}>
                  {project.status}
                </span>
              </div>
              <p>{project.summary}</p>
              <div className="inlineList">
                <span>{project.builderName}</span>
                <span>{project.contactChannel}</span>
                <span>Fit score {project.fitScore}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
