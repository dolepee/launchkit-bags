import { CandidateProject, LaunchKit } from "@/lib/types";

type Props = {
  project: CandidateProject;
  kit: LaunchKit;
};

export function LaunchRoom({ project, kit }: Props) {
  return (
    <section className="launchRoom">
      <div className="launchHero">
        <div>
          <span className="eyebrow">Launch room preview</span>
          <h1>{project.name}</h1>
          <p>{kit.oneLiner}</p>
        </div>
        <div className="heroBadge">
          <strong>{kit.tokenName}</strong>
          <span>{kit.tokenSymbol}</span>
        </div>
      </div>

      <div className="launchSections">
        <section className="paperBlock spotlightBlock">
          <span className="eyebrow">Launch story</span>
          <p>{kit.narrative}</p>
        </section>

        <section className="paperBlock">
          <span className="eyebrow">Why this stands out for Bags</span>
          <div className="projectGrid">
            {kit.bagsModules.map((module) => (
              <article className="projectCard" key={module.key}>
                <div className="rowTitle">
                  <h3>{module.label}</h3>
                  <span className={module.status === "ready" ? "tonePill toneGood" : module.status === "configured" ? "tonePill toneWarm" : "tonePill toneMuted"}>
                    {module.status}
                  </span>
                </div>
                <p>{module.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="paperBlock">
          <span className="eyebrow">Contributor economics</span>
          <div className="projectGrid">
            {kit.feeRecipients.map((item) => (
              <article className="projectCard" key={`${item.role}-${item.handle}`}>
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
          <span className="eyebrow">Proof path</span>
          <ul className="checkList">
            {kit.proofItems.map((item) => (
              <li key={item.label}>
                {item.label}: {item.target} ({item.status})
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
