import { AttendanceTimeEntryScreen } from "../../features/attendance-time/components/AttendanceTimeEntryScreen";

export function AttendanceTimeEntryPage() {
  return (
    <div className="dashboard-main">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__hero">
          <p className="eyebrow">Vardiya / Bordro</p>
          <h1>Mesai Saat Girisi</h1>
        </div>
      </header>
      <AttendanceTimeEntryScreen />
    </div>
  );
}
