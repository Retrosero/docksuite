import type { PurchaseInvoiceListItem } from "../types";

type PurchaseInvoiceCardListProps = {
  rows: PurchaseInvoiceListItem[];
  selectedInvoiceName: string | null;
  onSelect: (invoiceName: string) => void;
};

function toStatusClass(tone: PurchaseInvoiceListItem["paymentStatusTone"]) {
  if (tone === "positive") {
    return "purchase-invoice-status purchase-invoice-status--positive";
  }

  if (tone === "warning") {
    return "purchase-invoice-status purchase-invoice-status--warning";
  }

  return "purchase-invoice-status purchase-invoice-status--negative";
}

export function PurchaseInvoiceCardList({ rows, selectedInvoiceName, onSelect }: PurchaseInvoiceCardListProps) {
  if (rows.length === 0) {
    return <p className="purchase-invoice-empty-state">Filtreye uygun alis faturasi bulunamadi.</p>;
  }

  return (
    <section className="purchase-invoice-card-list" aria-label="Alis faturasi kart listesi">
      {rows.map((row) => {
        const isSelected = selectedInvoiceName === row.invoiceNo;

        return (
          <button
            className={`purchase-invoice-card${isSelected ? " is-selected" : ""}`}
            key={row.id}
            type="button"
            onClick={() => {
              onSelect(row.invoiceNo);
            }}
          >
            <div className="purchase-invoice-card__top">
              <div>
                <strong>{row.invoiceNo}</strong>
                <span>{row.supplier}</span>
              </div>
              <span className={toStatusClass(row.paymentStatusTone)}>{row.paymentStatusLabel}</span>
            </div>

            <div className="purchase-invoice-card__grid">
              <p>
                <span>Belge tarihi</span>
                {row.postingDateLabel}
              </p>
              <p>
                <span>Vade tarihi</span>
                {row.dueDateLabel}
              </p>
              <p>
                <span>Toplam</span>
                {row.grandTotalLabel}
              </p>
              <p>
                <span>Kalan borc</span>
                {row.outstandingAmountLabel}
              </p>
              <p>
                <span>Sirket</span>
                {row.company}
              </p>
            </div>
          </button>
        );
      })}
    </section>
  );
}
