import { BuilderApplicationForm } from "@/components/builder-application-form";
import { loadDashboard } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const { projects, kits } = await loadDashboard();
  const liveArtifacts = kits.filter((kit) => kit.bagsTokenInfo.status === "generated").length;
  const approved = kits.filter((kit) => kit.builderDecision === "approved").length;
  const recentProjects = projects.slice(0, 3);

  return (
    <section className="homePage">
      <div className="heroBand homeHero">
        <div className="heroCopy">
          <span className="eyebrow">Rolling intake</span>
          <h1>Apply with a verified project and turn it into a live Bags launch kit.</h1>
          <p>
            LaunchKit is a live intake surface for builders who want a Bags-native launch plan, a reviewable public launch room, and a
            direct path into token-info generation.
          </p>
          <div className="actionCluster">
            <span className="tonePill toneGood">{projects.length} tracked builders</span>
            <span className="tonePill toneWarm">{approved} approved kits</span>
            <span className="tonePill toneMuted">{liveArtifacts} live Bags artifacts</span>
          </div>
        </div>

        <div className="spotCard">
          <span className="eyebrow">What you need</span>
          <h2>Verified profile plus a real product thesis.</h2>
          <p>Submit your project, proof of identity, traction signals, and why Bags is the right home. LaunchKit creates the first kit immediately.</p>
        </div>
      </div>

      <div className="studioColumns">
        <div className="contentStack">
          <BuilderApplicationForm />
        </div>

        <aside className="contentRail">
          <section className="paperBlock accentBlock">
            <span className="eyebrow">What happens next</span>
            <ul className="checkList">
              <li>Create a launch kit from your application instantly.</li>
              <li>Review the token story and fee-sharing plan.</li>
              <li>Approve the brief and generate Bags token metadata.</li>
              <li>Share the public launch room as proof of traction.</li>
            </ul>
          </section>

          <section className="paperBlock">
            <span className="eyebrow">What we optimize for</span>
            <ul className="checkList">
              <li>Real builders with verified profiles.</li>
              <li>Products that can generate live Bags activity.</li>
              <li>Public proof surfaces judges and users can inspect quickly.</li>
            </ul>
          </section>

          <section className="paperBlock">
            <span className="eyebrow">Recent inbound</span>
            <div className="moduleList">
              {recentProjects.map((project) => (
                <article className="moduleCard" key={project.id}>
                  <div className="rowTitle">
                    <h3>{project.name}</h3>
                    <span className="tonePill toneMuted">{project.status}</span>
                  </div>
                  <p>{project.summary}</p>
                  <small>
                    {project.builderName} {project.sector ? `• ${project.sector}` : ""}
                  </small>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
