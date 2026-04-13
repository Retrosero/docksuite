import type { DashboardMetric } from "../types";

type DashboardMetricGridProps = {
  metrics: DashboardMetric[];
};

function toneClass(tone: DashboardMetric["tone"]) {
  return `tone-${tone}`;
}

export function DashboardMetricGrid({ metrics }: DashboardMetricGridProps) {
  return (
    <section className="dashboard-kpi-grid" aria-label="Temel metrikler">
      {metrics.map((metric) => (
        <article className={`dashboard-kpi ${toneClass(metric.tone)}`} key={metric.key}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <p>{metric.detail}</p>
        </article>
      ))}
    </section>
  );
}
