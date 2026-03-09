import Link from "next/link";
import { loadDashboard } from "@/lib/store";

export default async function HomePage() {
  const { projects, kits } = await loadDashboard();
  const featured = kits[0];
  const approved = kits.filter((kit) => kit.builderDecision === "approved").length;
  const liveArtifacts = kits.filter((kit) => kit.bagsTokenInfo.status === "generated").length;

  return (
    <section className="homePage">
      <div className="heroBand homeHero">
        <div className="heroCopy">
          <span className="eyebrow">Live Bags product</span>
          <h1>LaunchKit turns a verified builder application into a reviewable, public Bags launch flow.</h1>
          <p>
            This is not only an operator dashboard. It is a live intake and launch workflow for builders who want a Bags-native token
            plan, a public proof page, and an operator path into real token-info generation.
          </p>
          <div className="actionCluster">
            <Link className="buttonPrimary" href="/apply">
              Apply as builder
            </Link>
            <Link className="buttonGhost" href="/studio">
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
          <span className="eyebrow">Live scoreboard</span>
          <h2>{projects.length} tracked builders</h2>
          <p>Approved kits and generated Bags artifacts matter more than static mockups.</p>
          <div className="inlineList">
            <span>{approved} approved</span>
            <span>{liveArtifacts} live artifacts</span>
          </div>
        </div>
      </div>

      <div className="projectGrid">
        <article className="projectCard">
          <span className="eyebrow">Why this can win</span>
          <p>It connects builder intake, approval, launch economics, and a public Bags artifact in one flow judges and users can verify quickly.</p>
        </article>
        <article className="projectCard">
          <span className="eyebrow">What comes first</span>
          <p>The intake loop. A real builder must be able to apply and receive a concrete kit before deeper automation matters.</p>
        </article>
        <article className="projectCard">
          <span className="eyebrow">What comes next</span>
          <p>After approval: Bags token info, fee-sharing configuration, public proof surfaces, and repeatable launch-room distribution.</p>
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
                <span>{project.sector}</span>
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
