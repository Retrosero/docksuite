import {
  BriefcaseBusiness,
  ClipboardList,
  HardHat,
  FileX,
  TriangleAlert,
  Users
} from "lucide-react";
import type { DashboardMetric } from "../types";

type DashboardMetricGridProps = {
  metrics: DashboardMetric[];
};

function toneClass(tone: DashboardMetric["tone"]) {
  return `tone-${tone}`;
}

function metricIcon(key: string) {
  if (key === "employeeTotal") {
    return Users;
  }
  if (key === "todayShift") {
    return HardHat;
  }
  if (key === "openTask") {
    return ClipboardList;
  }
  if (key === "criticalStock") {
    return TriangleAlert;
  }
  if (key === "presentCrew") {
    return BriefcaseBusiness;
  }
  return FileX;
}

export function DashboardMetricGrid({ metrics }: DashboardMetricGridProps) {
  return (
    <section className="dashboard-kpi-grid" aria-label="Temel metrikler">
      {metrics.map((metric) => (
        <article className={`dashboard-kpi-card ${toneClass(metric.tone)}`} key={metric.key}>
          <div className="dashboard-kpi-card__top">
            <span className="dashboard-kpi-card__icon" aria-hidden="true">
              {(() => {
                const Icon = metricIcon(metric.key);
                return <Icon size={18} strokeWidth={2.2} />;
              })()}
            </span>
            <span className="dashboard-kpi-card__badge">{metric.detail}</span>
          </div>
          <div className="dashboard-kpi-card__body">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}
