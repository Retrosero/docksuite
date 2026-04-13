import type { DashboardData } from "../types";

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
    <header className="dashboard-topbar">
      <div>
        <p className="eyebrow">Operasyon dashboard</p>
        <h1>Gunluk saha ozeti</h1>
        <p className="dashboard-topbar__subline">
          Employee, Attendance, gorev ve stok verileri ERPNext kaynagindan canli okunur.
        </p>
      </div>

      <div className="dashboard-topbar__actions dashboard-topbar__actions--compact">
        <p className="dashboard-topbar__meta">
          Son guncelleme: <strong>{formatGeneratedAt(data?.generatedAt ?? null)}</strong>
        </p>
        <button className="dashboard-button dashboard-button--primary" disabled={loading} onClick={onRefresh} type="button">
          {loading ? "Yenileniyor..." : "Yenile"}
        </button>
      </div>
    </header>
  );
}
