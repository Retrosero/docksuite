import type { DashboardSnapshot } from "../types";

type HeroPanelProps = {
  snapshot: DashboardSnapshot;
};

export function HeroPanel({ snapshot }: HeroPanelProps) {
  return (
    <section className="hero-panel">
      <div className="hero-panel__content">
        <p className="eyebrow">Faz 3 baslangic ekrani</p>
        <h2>{snapshot.headline}</h2>
        <p className="hero-panel__subline">{snapshot.subline}</p>
      </div>
      <div className="hero-panel__metrics">
        <article className="metric-card">
          <span>Operasyon</span>
          <strong>{snapshot.activeTeamCount}</strong>
        </article>
        <article className="metric-card">
          <span>Takip</span>
          <strong>{snapshot.openIssueCount}</strong>
        </article>
      </div>
    </section>
  );
}
