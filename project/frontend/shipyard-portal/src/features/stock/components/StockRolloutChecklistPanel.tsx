import type {
  StockAuditSummary,
  StockItem,
  StockKpiSummary,
  StockProcurementLinkSummary,
  StockReconciliationAnalysis
} from "../types";

type StockRolloutChecklistPanelProps = {
  items: StockItem[];
  procurementData: StockProcurementLinkSummary | null;
  reconciliationData: StockReconciliationAnalysis | null;
  kpiData: StockKpiSummary | null;
  auditData: StockAuditSummary | null;
  procurementError: string | null;
  reconciliationError: string | null;
  kpiError: string | null;
  auditError: string | null;
};

type CheckStatus = "pass" | "warn" | "fail";
type ChecklistRow = {
  id: string;
  label: string;
  detail: string;
  status: CheckStatus;
};

function toStatusLabel(status: CheckStatus) {
  if (status === "pass") return "Gecerli";
  if (status === "warn") return "Uyari";
  return "Hata";
}

function toStatusClass(status: CheckStatus) {
  if (status === "pass") return "stock-op-badge stock-op-badge--success";
  if (status === "warn") return "stock-op-badge";
  return "stock-op-badge stock-op-badge--error";
}

export function StockRolloutChecklistPanel({
  items,
  procurementData,
  reconciliationData,
  kpiData,
  auditData,
  procurementError,
  reconciliationError,
  kpiError,
  auditError
}: StockRolloutChecklistPanelProps) {
  const unknownRiskCount = items.filter((row) => row.riskLevel === "unknown").length;
  const highDifference = reconciliationData?.criticalDifferenceCount ?? 0;
  const hasAnyError = Boolean(procurementError || reconciliationError || kpiError || auditError);

  const rows: ChecklistRow[] = [
    {
      id: "perm-procurement",
      label: "Procurement okuma yetkisi",
      detail: procurementData?.canRead ? "Yetki aktif" : "Yetki sinirli veya kapali",
      status: procurementData?.canRead ? "pass" : "warn"
    },
    {
      id: "perm-reconciliation",
      label: "Reconciliation okuma yetkisi",
      detail: reconciliationData?.canRead ? "Yetki aktif" : "Yetki sinirli veya kapali",
      status: reconciliationData?.canRead ? "pass" : "warn"
    },
    {
      id: "perm-audit",
      label: "Audit okuma yetkisi",
      detail: auditData?.canRead ? "Yetki aktif" : "Yetki sinirli veya kapali",
      status: auditData?.canRead ? "pass" : "warn"
    },
    {
      id: "api-health",
      label: "Panel API sagligi",
      detail: hasAnyError ? "Bir veya daha fazla panelde veri hatasi var" : "Panel API cagrilari stabil",
      status: hasAnyError ? "fail" : "pass"
    },
    {
      id: "data-unknown-risk",
      label: "Bilinmeyen risk orani",
      detail: `${unknownRiskCount} urun bilinmeyen riskte`,
      status: unknownRiskCount > Math.max(5, Math.floor(items.length * 0.2)) ? "warn" : "pass"
    },
    {
      id: "data-reconciliation-gap",
      label: "Sayim fark riski",
      detail: `${highDifference} yuksek fark satiri`,
      status: highDifference > 10 ? "fail" : highDifference > 0 ? "warn" : "pass"
    }
  ];

  return (
    <section className="stock-panel stock-panel--audit" aria-label="Rollout izleme checklist">
      <div className="stock-reconciliation-header">
        <div>
          <h3>Rollout Izleme Checklist</h3>
          <p>Yetki, hata ve veri kalitesi kontrollerini tek panelde toplar.</p>
        </div>
      </div>

      <div className="stock-reconciliation-table-wrap">
        <table className="stock-reconciliation-table">
          <thead>
            <tr>
              <th>Kontrol</th>
              <th>Durum</th>
              <th>Detay</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.label}</td>
                <td>
                  <span className={toStatusClass(row.status)}>{toStatusLabel(row.status)}</span>
                </td>
                <td>{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!kpiData?.canRead ? <p className="stock-empty-state">Not: KPI veri izni sinirliysa bazi kontroller kisitli degerlendirilir.</p> : null}
    </section>
  );
}
