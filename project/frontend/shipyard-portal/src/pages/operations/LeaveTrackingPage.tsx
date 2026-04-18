import { navigateTo } from "../../app/useAppRoute";
import { LeaveTrackingScreen } from "../../features/leave/components/LeaveTrackingScreen";

export function LeaveTrackingPage() {
  return (
    <div className="dashboard-main">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__hero">
          <p className="eyebrow">Izin Takibi</p>
          <h1>Izin Yonetimi</h1>
        </div>
        <div className="dashboard-topbar__actions">
          <button type="button" className="btn btn--primary" onClick={() => navigateTo("/izinler/yeni")}>
            + Yeni Izin
          </button>
        </div>
      </header>
      <LeaveTrackingScreen />
    </div>
  );
}
