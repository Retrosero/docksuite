import { PayrollPage } from "../../features/salary/components/PayrollPage";

export function PayrollPageWrapper() {
  return (
    <div className="dashboard-main">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__hero">
          <p className="eyebrow">Maaş Yonetimi</p>
          <h1>Bordro Hesaplama</h1>
        </div>
      </header>
      <PayrollPage />
    </div>
  );
}
