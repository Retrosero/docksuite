import type { ShiftAssignment } from "../types";

type ShiftAssignmentListProps = {
  rows: Array<ShiftAssignment & { shiftLabel?: string }>;
  onDeleteAssignment: (assignmentId: string) => void;
  deletingAssignmentId: string | null;
};

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

export function ShiftAssignmentList({ rows, onDeleteAssignment, deletingAssignmentId }: ShiftAssignmentListProps) {
  return (
    <section className="screen-card shift-plan-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Vardiya Plani</p>
          <h3>Vardiya atamalari</h3>
        </div>
        <span className="screen-chip">{rows.length} kayit</span>
      </div>

      {rows.length === 0 ? (
        <p className="shift-plan-empty-state">Vardiya atamasi bulunamadi.</p>
      ) : (
        <div className="shift-assignment-table-wrap">
          <table className="shift-assignment-table">
            <thead>
              <tr>
                <th>Personel</th>
                <th>Sicil</th>
                <th>Vardiya</th>
                <th>Baslangic</th>
                <th>Bitis</th>
                <th>Durum</th>
                <th>Islem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isDeleting = deletingAssignmentId === row.name;

                return (
                  <tr key={row.name}>
                    <td>
                      <strong>{row.employee_name ?? row.employee ?? "-"}</strong>
                    </td>
                    <td>{row.employee ?? "-"}</td>
                    <td>{row.shiftLabel ?? row.shift_type ?? "-"}</td>
                    <td>{formatDate(row.start_date)}</td>
                    <td>{formatDate(row.end_date)}</td>
                    <td>
                      <span className="shift-plan-status">{row.status ?? "Aktif"}</span>
                    </td>
                    <td>
                      <button
                        className="shift-plan-row-action"
                        disabled={isDeleting}
                        onClick={() => onDeleteAssignment(row.name)}
                        type="button"
                      >
                        {isDeleting ? "Kaldiriliyor..." : "Kaldir"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
