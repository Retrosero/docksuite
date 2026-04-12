import type { OperationsSnapshot } from "../types";

type OperationsHeroProps = {
  snapshot: OperationsSnapshot;
};

export function OperationsHero({ snapshot }: OperationsHeroProps) {
  return (
    <section className="operations-hero">
      <div className="operations-hero__content">
        <p className="eyebrow">Faz 4 baslangic ekrani</p>
        <h2>{snapshot.headline}</h2>
        <p className="operations-hero__subline">{snapshot.subline}</p>
      </div>
      <div className="operations-hero__stats">
        {snapshot.stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.helper}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
