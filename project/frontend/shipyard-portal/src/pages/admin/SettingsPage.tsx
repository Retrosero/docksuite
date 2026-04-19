import { TenantSettingsScreen } from "../../features/tenant-settings/components/TenantSettingsScreen";

export function SettingsPageWrapper() {
  return (
    <div className="dashboard-main">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar__hero">
          <p className="eyebrow">Yonetim</p>
          <h1>Ayarlar</h1>
        </div>
      </header>
      <TenantSettingsScreen />
    </div>
  );
}
