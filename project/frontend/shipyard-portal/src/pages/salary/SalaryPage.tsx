import { SalaryPage } from "../../features/salary/components/SalaryPage";

export function SalaryPageWrapper() {
  return (
    <div className="dashboard-main">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__hero">
          <p className="eyebrow">Maaş Yonetimi</p>
          <h1>Maas Ozeti</h1>
        </div>
      </header>
      <SalaryPage />
    </div>
  );
}
