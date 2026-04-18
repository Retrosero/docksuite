import type { OvertimeRequest } from "../types";

type OvertimeRequestListProps = {
  rows: OvertimeRequest[];
  viewMode: "employee" | "manager";
};

function statusClassName(tone: "positive" | "negative" | "warning" | "neutral") {
  if (tone === "positive") return "overtime-status overtime-status--positive";
  if (tone === "negative") return "overtime-status overtime-status--negative";
  if (tone === "warning") return "overtime-status overtime-status--warning";
  return "overtime-status overtime-status--neutral";
}

function toStatusMeta(status: string | null | undefined, workflowState: string | null | undefined) {
  const normalized = (workflowState ?? status ?? "").trim().toLowerCase();

  if (normalized === "approved") {
    return { status: "approved", statusLabel: "Onaylandi", statusTone: "positive" as const };
  }
  if (normalized === "rejected") {
    return { status: "rejected", statusLabel: "Reddedildi", statusTone: "negative" as const };
  }
  if (normalized === "cancelled") {
    return { status: "cancelled", statusLabel: "Iptal", statusTone: "negative" as const };
  }
  if (normalized === "open" || normalized === "pending") {
    return { status: "open", statusLabel: "Onay bekliyor", statusTone: "warning" as const };
  }
  return { status: "other", statusLabel: "Belirsiz", statusTone: "neutral" as const };
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parsed);
}

export function OvertimeRequestList({ rows, viewMode }: OvertimeRequestListProps) {
  const title = viewMode === "manager" ? "Tum mesai talepleri" : "Kendi mesai taleplerim";

  return (
    <section className="screen-card overtime-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Overtime Request</p>
          <h3>{title}</h3>
        </div>
        <span className="screen-chip">{rows.length} kayit</span>
      </div>

      {rows.length === 0 ? (
        <p className="overtime-empty-state">Secilen filtrelerle uyumlu mesai kaydi bulunamadi.</p>
      ) : null}

      {rows.length > 0 ? (
        <div className="overtime-request-list">
          {rows.map((row) => {
            const statusMeta = toStatusMeta(row.status, row.workflow_state);
            return (
              <article className="overtime-request-card" key={row.name}>
                <div className="overtime-request-card__top">
                  <div>
                    <strong>{row.employee_name ?? row.employee ?? "-"}</strong>
                    <span>{row.employee ?? "-"}</span>
                  </div>
                  <span className={statusClassName(statusMeta.statusTone)}>{statusMeta.statusLabel}</span>
                </div>

                <div className="overtime-request-card__grid">
                  <p>
                    <span>Tarih</span>
                    {formatDate(row.date)}
                  </p>
                  <p>
                    <span>Saat</span>
                    {row.hours ?? 0} saat
                  </p>
                  <p>
                    <span>Durum</span>
                    {row.status ?? "-"}
                  </p>
                  {row.reason ? (
                    <p className="p--full">
                      <span>Aciklama</span>
                      {row.reason}
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
