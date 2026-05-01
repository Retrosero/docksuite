import type {
  StockAuditSummary,
  StockItem,
  StockProcurementLinkSummary,
  StockReconciliationAnalysis
} from "../types";

type StockTenantOperationsPanelProps = {
  items: StockItem[];
  procurementData: StockProcurementLinkSummary | null;
  reconciliationData: StockReconciliationAnalysis | null;
  auditData: StockAuditSummary | null;
  procurementError: string | null;
  reconciliationError: string | null;
  auditError: string | null;
};

function toStatusLabel(hasError: boolean) {
  return hasError ? "Aksiyon gerekli" : "Stabil";
}

export function StockTenantOperationsPanel({
  items,
  procurementData,
  reconciliationData,
  auditData,
  procurementError,
  reconciliationError,
  auditError
}: StockTenantOperationsPanelProps) {
  const criticalStockCount = items.filter((row) => row.riskLevel === "critical").length;
  const activeAlertCount =
    criticalStockCount +
    (procurementData?.totalOpenMaterialRequests ?? 0) +
    (procurementData?.totalOpenPurchaseOrders ?? 0);
  const openReconciliationCount = reconciliationData?.criticalDifferenceCount ?? 0;
  const hasIncident = Boolean(procurementError || reconciliationError || auditError);
  const lastAuditUpdate = auditData?.rows[0]?.updatedAt ?? "-";

  return (
    <section className="stock-panel stock-panel--kpi" aria-label="Tenant operasyon ozeti">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Tenant Operasyon Ozeti</h3>
          <p>Kritik operasyon sinyalleri tek panelde izlenir.</p>
        </div>
        <span className={hasIncident ? "stock-badge stock-badge--critical" : "stock-badge"}>
          Incident: {toStatusLabel(hasIncident)}
        </span>
      </div>
      <div className="stock-kpi-grid">
        <article>
          <h4>Kritik Stok</h4>
          <p>{criticalStockCount}</p>
          <span>Item risk seviyesi kritik olan kayitlar</span>
        </article>
        <article>
          <h4>Aktif Uyari</h4>
          <p>{activeAlertCount}</p>
          <span>Kritik stok + acik talep/siparis sinyali</span>
        </article>
        <article>
          <h4>Acik Reconciliation</h4>
          <p>{openReconciliationCount}</p>
          <span>Kritik fark limiti ustu satir adedi</span>
        </article>
        <article>
          <h4>Son Incident Ozet</h4>
          <p>{toStatusLabel(hasIncident)}</p>
          <span>Son audit guncelleme: {lastAuditUpdate}</span>
        </article>
      </div>
    </section>
  );
}
