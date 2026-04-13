import { navigateTo } from "../../../app/useAppRoute";

const quickActions = [
  {
    title: "Personel listesi",
    description: "Calisan kayitlarini ve durumlarini gor",
    path: "/personel"
  },
  {
    title: "Gorev ekrani",
    description: "Acik gorevleri durum bazli takip et",
    path: "/gorevler"
  },
  {
    title: "Saha bildirimi",
    description: "Saha notu ve sorun kaydi ac",
    path: "/saha-bildirimi"
  },
  {
    title: "Zimmet akis",
    description: "Teslim ve iade durumlarini guncelle",
    path: "/zimmet"
  }
];

export function DashboardQuickActions() {
  return (
    <article className="card dashboard-card dashboard-card--soft">
      <div className="dashboard-card__header">
        <div>
          <p className="eyebrow">Hizli aksiyonlar</p>
          <h3>Tek dokunus islemler</h3>
        </div>
      </div>
      <div className="dashboard-action-list">
        {quickActions.map((action) => (
          <button className="dashboard-action" key={action.path} onClick={() => navigateTo(action.path)} type="button">
            <strong>{action.title}</strong>
            <span>{action.description}</span>
          </button>
        ))}
      </div>
    </article>
  );
}
