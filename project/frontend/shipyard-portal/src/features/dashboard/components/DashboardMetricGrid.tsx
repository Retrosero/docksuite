import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DashboardMetric } from "../types";

type DashboardMetricGridProps = {
  metrics: DashboardMetric[];
};

function getToneClasses(tone: string): string {
  switch (tone) {
    case "sea":
      return "metric-card--sea";
    case "sand":
      return "metric-card--sand";
    case "steel":
      return "metric-card--steel";
    case "sun":
      return "metric-card--sun";
    default:
      return "";
  }
}

function getDeltaIcon(deltaOrDetail: string | null | undefined): React.ReactNode {
  const value = (deltaOrDetail ?? "").trim();

  if (value.startsWith("+")) {
    return <TrendingUp size={14} />;
  }
  if (value.startsWith("-")) {
    return <TrendingDown size={14} />;
  }
  return <Minus size={14} />;
}

export function DashboardMetricGrid({ metrics }: DashboardMetricGridProps) {
  if (metrics.length === 0) return null;

  return (
    <div className="dashboard-metric-grid">
      {metrics.map((metric) => (
        <article className={`metric-card ${getToneClasses(metric.tone)}`} key={metric.key}>
          <span className="metric-card__label">{metric.label}</span>
          <strong className="metric-card__value">{metric.value}</strong>
          <span className="metric-card__detail">
            {getDeltaIcon(metric.delta ?? metric.detail)}
            {metric.detail}
          </span>
        </article>
      ))}
    </div>
  );
}
