import type { PurchaseInvoiceSummary } from "../types";

type PurchaseInvoiceSummaryCardsProps = {
  summary: PurchaseInvoiceSummary;
};

export function PurchaseInvoiceSummaryCards({ summary }: PurchaseInvoiceSummaryCardsProps) {
  return (
    <section className="purchase-invoice-summary-grid" aria-label="Alis faturasi ozet kartlari">
      <article>
        <span>Fatura adedi</span>
        <strong>{summary.totalCount}</strong>
      </article>
      <article>
        <span>Toplam fatura tutari</span>
        <strong>{summary.totalGrandAmountLabel}</strong>
      </article>
      <article>
        <span>Toplam kalan borc</span>
        <strong>{summary.totalOutstandingAmountLabel}</strong>
      </article>
    </section>
  );
}
