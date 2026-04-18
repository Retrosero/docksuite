import type { BenefitItem } from "../types";

type BenefitListProps = {
  benefits: BenefitItem[];
  loading: boolean;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY"
  }).format(amount);
}

export function BenefitList({ benefits, loading }: BenefitListProps) {
  if (loading) {
    return (
      <article className="benefit-list-card">
        <p className="eyebrow">Yan Haklar</p>
        <p className="benefit-state">Yan haklar yukleniyor...</p>
      </article>
    );
  }

  if (!benefits || benefits.length === 0) {
    return (
      <article className="benefit-list-card benefit-list-card--empty">
        <p className="eyebrow">Yan Haklar</p>
        <div className="benefit-empty">
          <p>Bu personel icin tanimli yan hak bulunmuyor.</p>
        </div>
      </article>
    );
  }

  const allowances = benefits.filter(b => b.type === "allowance");
  const deductions = benefits.filter(b => b.type === "deduction");
  const totalAllowances = allowances.reduce((sum, b) => sum + b.amount, 0);
  const totalDeductions = deductions.reduce((sum, b) => sum + b.amount, 0);

  return (
    <article className="benefit-list-card">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Yan Haklar</p>
          <h3>Ek Odemeler ve Kesintiler</h3>
        </div>
      </div>

      <div className="benefit-totals">
        <div className="benefit-total benefit-total--allowance">
          <span>Toplam Ek Odeme</span>
          <strong>{formatCurrency(totalAllowances)}</strong>
        </div>
        {totalDeductions > 0 && (
          <div className="benefit-total benefit-total--deduction">
            <span>Toplam Kesinti</span>
            <strong>{formatCurrency(totalDeductions)}</strong>
          </div>
        )}
      </div>

      <div className="benefit-items">
        {allowances.length > 0 && (
          <div className="benefit-group">
            <h4>Ek Odemeler</h4>
            {allowances.map(benefit => (
              <div key={benefit.id} className="benefit-item benefit-item--allowance">
                <span className="benefit-name">{benefit.benefitName}</span>
                <span className="benefit-amount">{formatCurrency(benefit.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {deductions.length > 0 && (
          <div className="benefit-group">
            <h4>Kesintiler</h4>
            {deductions.map(benefit => (
              <div key={benefit.id} className="benefit-item benefit-item--deduction">
                <span className="benefit-name">{benefit.benefitName}</span>
                <span className="benefit-amount">-{formatCurrency(benefit.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
