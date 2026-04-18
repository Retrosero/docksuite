import type { SalaryInfo } from "../types";

type SalaryInfoCardProps = {
  salaryInfo: SalaryInfo | null;
  loading: boolean;
};

function formatCurrency(amount: number, currency: string = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency
  }).format(amount);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parsed);
}

export function SalaryInfoCard({ salaryInfo, loading }: SalaryInfoCardProps) {
  if (loading) {
    return (
      <article className="salary-info-card">
        <p className="eyebrow">Maaş Bilgisi</p>
        <p className="salary-state">Maas bilgileri yukleniyor...</p>
      </article>
    );
  }

  if (!salaryInfo) {
    return (
      <article className="salary-info-card salary-info-card--empty">
        <p className="eyebrow">Maaş Bilgisi</p>
        <div className="salary-empty">
          <p>Bu personel icin maas kaydi bulunmuyor.</p>
          <p className="salary-empty-hint">Maaş bilgisi eklemek icin duzenle sayfasini kullanin.</p>
        </div>
      </article>
    );
  }

  return (
    <article className="salary-info-card">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Maaş Bilgisi</p>
          <h3>Guncel Maaş</h3>
        </div>
        <span className="salary-badge">{salaryInfo.payGrade || "Standart"}</span>
      </div>

      <div className="salary-main-amount">
        <span className="salary-amount">{formatCurrency(salaryInfo.baseSalary, salaryInfo.currency)}</span>
        <span className="salary-period">/ay</span>
      </div>

      <dl className="salary-details">
        <div className="salary-detail-row">
          <dt>Para Birimi</dt>
          <dd>{salaryInfo.currency}</dd>
        </div>
        <div className="salary-detail-row">
          <dt>Ucret Gradi</dt>
          <dd>{salaryInfo.payGrade || "-"}</dd>
        </div>
        <div className="salary-detail-row">
          <dt>Gecerlilik</dt>
          <dd>{formatDate(salaryInfo.effectiveFrom)}</dd>
        </div>
      </dl>
    </article>
  );
}
