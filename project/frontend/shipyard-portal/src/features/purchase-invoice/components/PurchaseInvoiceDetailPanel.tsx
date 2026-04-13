import type { PurchaseInvoiceDetailData } from "../types";

type PurchaseInvoiceDetailPanelProps = {
  detail: PurchaseInvoiceDetailData | null;
  loading: boolean;
  error: string | null;
};

function toPaymentBadgeClass(tone: PurchaseInvoiceDetailData["paymentStatusTone"]) {
  if (tone === "positive") {
    return "purchase-invoice-status purchase-invoice-status--positive";
  }

  if (tone === "warning") {
    return "purchase-invoice-status purchase-invoice-status--warning";
  }

  return "purchase-invoice-status purchase-invoice-status--negative";
}

export function PurchaseInvoiceDetailPanel({ detail, loading, error }: PurchaseInvoiceDetailPanelProps) {
  return (
    <aside className="screen-card purchase-invoice-detail" aria-label="Alis faturasi detay paneli">
      <h3>Fatura detayi</h3>

      {loading ? <p className="purchase-invoice-empty-state">Detay yukleniyor...</p> : null}
      {error ? <p className="purchase-invoice-empty-state purchase-invoice-empty-state--error">{error}</p> : null}
      {!loading && !error && !detail ? <p className="purchase-invoice-empty-state">Detay gormek icin listeden bir fatura secin.</p> : null}

      {!loading && !error && detail ? (
        <div className="purchase-invoice-detail__content">
          <div className="purchase-invoice-detail__top">
            <div>
              <strong>{detail.invoiceNo}</strong>
              <span>{detail.supplier}</span>
            </div>
            <span className={toPaymentBadgeClass(detail.paymentStatusTone)}>{detail.paymentStatusLabel}</span>
          </div>

          <dl className="purchase-invoice-detail__meta">
            <div>
              <dt>Sirket</dt>
              <dd>{detail.company}</dd>
            </div>
            <div>
              <dt>Belge tarihi</dt>
              <dd>{detail.postingDateLabel}</dd>
            </div>
            <div>
              <dt>Vade tarihi</dt>
              <dd>{detail.dueDateLabel}</dd>
            </div>
            <div>
              <dt>ERPNext durum</dt>
              <dd>{detail.status}</dd>
            </div>
            <div>
              <dt>Toplam tutar</dt>
              <dd>{detail.grandTotalLabel}</dd>
            </div>
            <div>
              <dt>Kalan borc</dt>
              <dd>{detail.outstandingAmountLabel}</dd>
            </div>
          </dl>

          {detail.remarks ? (
            <p className="purchase-invoice-detail__remarks">
              <span>Aciklama</span>
              {detail.remarks}
            </p>
          ) : null}

          <div className="purchase-invoice-detail__items">
            <h4>Kalemler</h4>
            {detail.items.length === 0 ? (
              <p className="purchase-invoice-empty-state">Kalem kaydi bulunamadi.</p>
            ) : (
              detail.items.map((item) => (
                <article key={item.id}>
                  <strong>{item.itemName}</strong>
                  <span>{item.itemCode}</span>
                  <p>
                    <span>Miktar</span>
                    {item.qtyLabel}
                  </p>
                  <p>
                    <span>Tutar</span>
                    {item.amountLabel}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
