import type { PurchaseInvoiceListItem } from "../types";

type PurchaseInvoiceTableProps = {
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

export function PurchaseInvoiceTable({ rows, selectedInvoiceName, onSelect }: PurchaseInvoiceTableProps) {
  if (rows.length === 0) {
    return <p className="purchase-invoice-empty-state">Filtreye uygun alis faturasi bulunamadi.</p>;
  }

  return (
    <section className="purchase-invoice-table-wrap" aria-label="Alis faturasi tablo gorunumu">
      <table className="purchase-invoice-table">
        <thead>
          <tr>
            <th>Fatura no</th>
            <th>Tedarikci</th>
            <th>Belge tarihi</th>
            <th>Vade tarihi</th>
            <th>Toplam</th>
            <th>Kalan borc</th>
            <th>Odeme durumu</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSelected = selectedInvoiceName === row.invoiceNo;

            return (
              <tr
                className={isSelected ? "is-selected" : ""}
                key={row.id}
                onClick={() => {
                  onSelect(row.invoiceNo);
                }}
              >
                <td>
                  <strong>{row.invoiceNo}</strong>
                  <span>{row.company}</span>
                </td>
                <td>{row.supplier}</td>
                <td>{row.postingDateLabel}</td>
                <td>{row.dueDateLabel}</td>
                <td>{row.grandTotalLabel}</td>
                <td>{row.outstandingAmountLabel}</td>
                <td>
                  <span className={toStatusClass(row.paymentStatusTone)}>{row.paymentStatusLabel}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
