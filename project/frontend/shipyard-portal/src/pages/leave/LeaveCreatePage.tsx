import { LeaveCreatePage } from "../../features/leave/components/LeaveCreatePage";

export function LeaveCreatePageWrapper() {
  return (
    <div className="dashboard-main">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__hero">
          <p className="eyebrow">Izin Yonetimi</p>
          <h1>Yeni Izin Basvurusu</h1>
        </div>
      </header>
      <LeaveCreatePage />
    </div>
  );
}
