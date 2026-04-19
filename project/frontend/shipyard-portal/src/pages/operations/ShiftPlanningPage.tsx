import { ShiftPlanningScreen } from "../../features/shift-planning/components/ShiftPlanningScreen";

export function ShiftPlanningPage() {
  return (
    <div className="dashboard-main">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__hero">
          <p className="eyebrow">Vardiya Planlamasi</p>
          <h1>Vardiya Plani</h1>
        </div>
      </header>
      <ShiftPlanningScreen />
    </div>
  );
}
