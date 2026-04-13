import type { DashboardData } from "../types";
import { navigateTo } from "../../../app/useAppRoute";

type DashboardTopBarProps = {
  data: DashboardData | null;
  loading: boolean;
  onRefresh: () => void;
};

function formatGeneratedAt(value: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
}

export function DashboardTopBar({ data, loading, onRefresh }: DashboardTopBarProps) {
  return (
    <header className="dashboard-topbar card">
      <div className="dashboard-topbar__copy">
        <p className="eyebrow">Maritime Precision</p>
        <h1>Operasyon görünümü</h1>
        <p className="dashboard-topbar__subline">
          ERPNext kaynaklı vardiya, görev, saha bildirimi ve stok verileri tek ekranda okunur.
        </p>
        <div className="dashboard-topbar__chips" aria-label="Hızlı durum etiketleri">
          <span>Canlı</span>
          <span>Mobil uyumlu</span>
          <span>Tenant-safe</span>
        </div>
      </div>

      <div className="dashboard-topbar__actions">
        <label className="dashboard-search" htmlFor="dashboard-search">
          <span>Hızlı arama</span>
          <input
            id="dashboard-search"
            name="dashboard-search"
            placeholder="Görev, personel, stok ara..."
            type="search"
          />
        </label>

        <div className="dashboard-topbar__meta">
          <span>Son güncelleme</span>
          <strong>{formatGeneratedAt(data?.generatedAt ?? null)}</strong>
        </div>

        <button className="dashboard-button dashboard-button--ghost" disabled={loading} onClick={onRefresh} type="button">
          {loading ? "Yenileniyor..." : "Yenile"}
        </button>

        <button className="dashboard-button dashboard-button--primary" type="button" onClick={() => navigateTo("/gorevler")}>
          Görevleri aç
        </button>
      </div>
    </header>
  );
}
