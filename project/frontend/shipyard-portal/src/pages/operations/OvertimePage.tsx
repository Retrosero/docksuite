import { OvertimeScreen } from "../../features/overtime/components/OvertimeScreen";

export function OvertimePage() {
  return (
    <div className="dashboard-main">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__hero">
          <p className="eyebrow">Mesai Yonetimi</p>
          <h1>Fazla Mesai Takibi</h1>
        </div>
      </header>
      <OvertimeScreen />
    </div>
  );
}
