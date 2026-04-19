import { OvertimeApprovalScreen } from "../../features/overtime/components/OvertimeApprovalScreen";

export function OvertimeApprovalPage() {
  return (
    <div className="dashboard-main">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__hero">
          <p className="eyebrow">Mesai Onay</p>
          <h1>Mesai Onay Ekrani</h1>
        </div>
      </header>
      <OvertimeApprovalScreen />
    </div>
  );
}
