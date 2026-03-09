import { CandidateProject, LaunchKit } from "@/lib/types";
import { normalizeBagsMetadata } from "@/lib/bags-metadata";

type Props = {
  project: CandidateProject;
  kit: LaunchKit;
};

export function LaunchRoom({ project, kit }: Props) {
  const metadata = normalizeBagsMetadata(kit.bagsTokenInfo.tokenMetadata, kit.bagsTokenInfo.uri);

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
          <span className="eyebrow">Token metadata brief</span>
          <div className="projectGrid">
            <article className="projectCard">
              <div className="rowTitle">
                <h3>Description</h3>
                <span className="tonePill toneMuted">draft</span>
              </div>
              <p>{kit.tokenDescription}</p>
            </article>
            <article className="projectCard">
              <div className="rowTitle">
                <h3>Image asset</h3>
                <span className={kit.bagsTokenInfo.imageUrl ? "tonePill toneGood" : "tonePill toneMuted"}>
                  {kit.bagsTokenInfo.imageUrl ? "set" : "missing"}
                </span>
              </div>
              <p>{kit.bagsTokenInfo.imageUrl || "No image URL configured yet."}</p>
            </article>
          </div>
        </section>

        {project.projectUrl || project.verifiedProfileUrl || project.tractionSummary ? (
          <section className="paperBlock">
            <span className="eyebrow">Proof surface</span>
            <div className="projectGrid">
              {project.projectUrl ? (
                <article className="projectCard">
                  <div className="rowTitle">
                    <h3>Project URL</h3>
                    <span className="tonePill toneGood">live</span>
                  </div>
                  <p>{project.projectUrl}</p>
                </article>
              ) : null}
              {project.verifiedProfileUrl ? (
                <article className="projectCard">
                  <div className="rowTitle">
                    <h3>Verified profile</h3>
                    <span className="tonePill toneGood">ready</span>
                  </div>
                  <p>{project.verifiedProfileUrl}</p>
                </article>
              ) : null}
              {project.tractionSummary ? (
                <article className="projectCard">
                  <div className="rowTitle">
                    <h3>Traction signal</h3>
                    <span className="tonePill toneWarm">live</span>
                  </div>
                  <p>{project.tractionSummary}</p>
                </article>
              ) : null}
            </div>
          </section>
        ) : null}

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
          <span className="eyebrow">Bags token artifact</span>
          <div className="projectGrid">
            <article className="projectCard">
              <div className="rowTitle">
                <h3>Status</h3>
                <span className={kit.bagsTokenInfo.status === "generated" ? "tonePill toneGood" : kit.bagsTokenInfo.status === "failed" ? "tonePill toneBad" : "tonePill toneMuted"}>
                  {kit.bagsTokenInfo.status}
                </span>
              </div>
              <p>{kit.bagsTokenInfo.lastError ?? "Generate Bags token info from the studio to turn this launch room into a real Bags-backed artifact."}</p>
            </article>
            <article className="projectCard">
              <div className="rowTitle">
                <h3>Mint</h3>
                <span className="tonePill toneMuted">{kit.bagsTokenInfo.tokenMint ? "live" : "pending"}</span>
              </div>
              <p>{kit.bagsTokenInfo.tokenMint ?? "No Bags mint generated yet."}</p>
            </article>
            <article className="projectCard">
              <div className="rowTitle">
                <h3>Metadata URI</h3>
                <span className="tonePill toneMuted">{metadata.uri ? "ready" : "pending"}</span>
              </div>
              <p>{metadata.uri ?? "No metadata URI returned yet."}</p>
            </article>
            {metadata.tokenMetadata ? (
              <article className="projectCard">
                <div className="rowTitle">
                  <h3>Metadata account</h3>
                  <span className="tonePill toneMuted">ready</span>
                </div>
                <p>{metadata.tokenMetadata}</p>
              </article>
            ) : null}
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
