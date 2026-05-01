import type {
  StockAdvancedReportSummary,
  StockAuditSummary,
  StockItem,
  StockKpiSummary,
  StockProcurementLinkSummary,
  StockReconciliationAnalysis
} from "../types";

type StockExportPanelProps = {
  items: StockItem[];
  reconciliationData: StockReconciliationAnalysis | null;
  procurementData: StockProcurementLinkSummary | null;
  kpiData: StockKpiSummary | null;
  auditData: StockAuditSummary | null;
  advancedReport: StockAdvancedReportSummary | null;
};

const EXPORT_ROW_LIMIT = 500;

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const escaped = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(","));
  const csv = `\uFEFF${escaped.join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function todayStamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export function StockExportPanel({
  items,
  reconciliationData,
  procurementData,
  kpiData,
  auditData,
  advancedReport
}: StockExportPanelProps) {
  const exportStockItems = () => {
    const rows = items.slice(0, EXPORT_ROW_LIMIT).map((row) => [
      row.itemCode,
      row.itemName,
      row.itemGroup,
      row.riskLevel,
      row.stockQtyLabel
    ]);
    downloadCsv(`stok-urun-listesi-${todayStamp()}.csv`, [["Item Code", "Item Name", "Item Group", "Risk", "Stock Qty"], ...rows]);
  };

  const exportReconciliation = () => {
    const rows = (reconciliationData?.rows ?? []).slice(0, EXPORT_ROW_LIMIT).map((row) => [
      row.reconciliationId,
      row.postingDate,
      row.itemCode,
      row.warehouse,
      row.currentQtyLabel,
      row.countedQtyLabel,
      row.qtyDifferenceLabel
    ]);
    downloadCsv(
      `stok-reconciliation-${todayStamp()}.csv`,
      [["Reconciliation", "Date", "Item", "Warehouse", "Current Qty", "Counted Qty", "Difference"], ...rows]
    );
  };

  const exportProcurement = () => {
    const rows = (procurementData?.rows ?? []).slice(0, EXPORT_ROW_LIMIT).map((row) => [
      row.itemCode,
      row.itemName,
      row.openMaterialRequestCount,
      row.openPurchaseOrderCount,
      row.purchaseReceiptCount,
      row.lastPurchaseInvoiceId ?? "",
      row.lastPurchaseInvoiceDate ?? ""
    ]);
    downloadCsv(
      `stok-procurement-${todayStamp()}.csv`,
      [["Item", "Name", "Open Request", "Open PO", "Receipt", "Last Invoice", "Invoice Date"], ...rows]
    );
  };

  const exportKpiTrend = () => {
    const rows = (kpiData?.trend ?? []).slice(0, EXPORT_ROW_LIMIT).map((row) => [row.date, row.movementLabel, row.movementValue]);
    downloadCsv(`stok-kpi-trend-${todayStamp()}.csv`, [["Date", "Movement Label", "Movement Value"], ...rows]);
  };

  const exportAudit = () => {
    const rows = (auditData?.rows ?? []).slice(0, EXPORT_ROW_LIMIT).map((row) => [
      row.doctype,
      row.documentId,
      row.stateLabel,
      row.statusLabel,
      row.actor,
      row.postingDate,
      row.updatedAt
    ]);
    downloadCsv(`stok-audit-${todayStamp()}.csv`, [["Doctype", "Document", "State", "Status", "Actor", "Date", "Updated"], ...rows]);
  };

  const exportAdvancedRisk = () => {
    const rows = (advancedReport?.drilldownRows ?? []).slice(0, EXPORT_ROW_LIMIT).map((row) => [
      row.itemCode,
      row.itemName,
      row.riskLabel,
      row.stockQtyLabel,
      row.openMaterialRequestCount,
      row.openPurchaseOrderCount,
      row.suggestedActionLabel
    ]);
    downloadCsv(
      `stok-ileri-risk-${todayStamp()}.csv`,
      [["Item", "Name", "Risk", "Stock", "Open Request", "Open PO", "Suggestion"], ...rows]
    );
  };

  return (
    <section className="stock-panel stock-panel--kpi" aria-label="Stock export paneli">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Operasyonel Export</h3>
          <p>CSV export ciktilari tenant-safe satir limitiyle olusturulur (max {EXPORT_ROW_LIMIT}).</p>
        </div>
      </div>
      <div className="stock-action-buttons">
        <button type="button" onClick={exportStockItems}>Urun Listesi CSV</button>
        <button type="button" onClick={exportReconciliation}>Reconciliation CSV</button>
        <button type="button" onClick={exportProcurement}>Procurement CSV</button>
        <button type="button" onClick={exportKpiTrend}>KPI Trend CSV</button>
        <button type="button" onClick={exportAudit}>Audit CSV</button>
        <button type="button" onClick={exportAdvancedRisk}>Ileri Risk CSV</button>
      </div>
    </section>
  );
}
