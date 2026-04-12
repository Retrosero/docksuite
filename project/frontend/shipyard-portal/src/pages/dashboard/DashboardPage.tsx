import { HeroPanel } from "../../features/dashboard/components/HeroPanel";
import { OperationsBoard } from "../../features/dashboard/components/OperationsBoard";
import { ShiftSummary } from "../../features/dashboard/components/ShiftSummary";
import { dashboardSnapshot } from "../../features/dashboard/data/dashboardSnapshot";

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <HeroPanel snapshot={dashboardSnapshot} />
      <div className="dashboard-page__grid">
        <OperationsBoard modules={dashboardSnapshot.modules} />
        <ShiftSummary shift={dashboardSnapshot.shift} />
      </div>
    </div>
  );
}
