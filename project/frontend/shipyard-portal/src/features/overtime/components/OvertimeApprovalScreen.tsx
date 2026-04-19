import { startTransition, useEffect, useMemo, useState } from "react";
import { useOvertimeActorAccess } from "../hooks/useOvertimeActorAccess";
import {
  approveOvertimeRequests,
  fetchOvertimeApprovalQueue,
  getOvertimeStatusOptions,
  rejectOvertimeRequests
} from "../services/overtimeService";
import type { OvertimeFilterState, OvertimeRequest } from "../types";

const INITIAL_FILTERS: OvertimeFilterState = {
  employee: "",
  status: "Open",
  startDate: "",
  endDate: "",
  searchText: ""
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

export function OvertimeApprovalScreen() {
  const { access, loading: actorLoading } = useOvertimeActorAccess();
  const [filters, setFilters] = useState<OvertimeFilterState>(INITIAL_FILTERS);
  const [rows, setRows] = useState<OvertimeRequest[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (actorLoading) return;
    if (!access.canApprove) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchOvertimeApprovalQueue(filters);
        if (!cancelled) {
          setRows(result);
          setSelectedIds((prev) => prev.filter((id) => result.some((row) => row.name === id)));
        }
      } catch {
        if (!cancelled) {
          setError("Mesai onay listesi su anda alinamadi. Lutfen tekrar deneyin.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [access.canApprove, actorLoading, filters, refreshToken]);

  const employeeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) {
      map.set(row.employee, row.employee_name || row.employee);
    }
    return [...map.entries()].map(([id, label]) => ({ id, label }));
  }, [rows]);

  const allVisibleSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.name));

  const toggleSelected = (name: string) => {
    setSelectedIds((prev) => (prev.includes(name) ? prev.filter((id) => id !== name) : [...prev, name]));
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(rows.map((row) => row.name));
  };

  const refresh = () => setRefreshToken((prev) => prev + 1);

  const runApprove = async () => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await approveOvertimeRequests(selectedIds);
      setSelectedIds([]);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onay islemi basarisiz oldu.");
    } finally {
      setSubmitting(false);
    }
  };

  const runReject = async () => {
    if (selectedIds.length === 0) return;
    if (!rejectReason.trim()) {
      setError("Red aciklamasi zorunludur.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await rejectOvertimeRequests(selectedIds, rejectReason.trim());
      setRejectReason("");
      setSelectedIds([]);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Red islemi basarisiz oldu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!actorLoading && !access.canApprove) {
    return <p className="overtime-empty-state overtime-empty-state--error">Bu ekran icin mesai onay yetkiniz bulunmuyor.</p>;
  }

  return (
    <div className="overtime-tracking-stack">
      <section className="screen-card overtime-panel overtime-panel--filters">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Mesai Onay</p>
            <h3>Onay kuyrugu</h3>
          </div>
          <button className="overtime-refresh-button" disabled={loading} onClick={refresh} type="button">
            Yenile
          </button>
        </div>

        <div className="overtime-filter-grid">
          <label>
            <span>Durum</span>
            <select
              onChange={(event) => startTransition(() => setFilters((prev) => ({ ...prev, status: event.target.value })))}
              value={filters.status}
            >
              {getOvertimeStatusOptions().map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Personel</span>
            <select
              onChange={(event) => startTransition(() => setFilters((prev) => ({ ...prev, employee: event.target.value })))}
              value={filters.employee}
            >
              <option value="">Tum personeller</option>
              {employeeOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Baslangic tarihi</span>
            <input
              type="date"
              onChange={(event) => startTransition(() => setFilters((prev) => ({ ...prev, startDate: event.target.value })))}
              value={filters.startDate}
            />
          </label>

          <label>
            <span>Bitis tarihi</span>
            <input
              type="date"
              onChange={(event) => startTransition(() => setFilters((prev) => ({ ...prev, endDate: event.target.value })))}
              value={filters.endDate}
            />
          </label>

          <label className="label--full">
            <span>Ara</span>
            <input
              type="search"
              placeholder="Personel veya aciklama ara..."
              onChange={(event) => startTransition(() => setFilters((prev) => ({ ...prev, searchText: event.target.value })))}
              value={filters.searchText}
            />
          </label>
        </div>
      </section>

      {error ? <p className="overtime-empty-state overtime-empty-state--error">{error}</p> : null}
      {loading ? <p className="overtime-empty-state">Mesai onay listesi yukleniyor...</p> : null}

      {!loading ? (
        <section className="screen-card overtime-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Onay Listesi</p>
              <h3>Bekleyen mesailer</h3>
            </div>
            <button className="overtime-refresh-button" type="button" onClick={toggleSelectAll}>
              {allVisibleSelected ? "Secimi temizle" : "Tumunu sec"}
            </button>
          </div>

          <div className="overtime-approval-toolbar">
            <span className="screen-chip">{selectedIds.length} secili</span>
            <input
              type="text"
              placeholder="Red aciklamasi"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
            />
            <button className="btn btn--secondary" type="button" disabled={submitting || selectedIds.length === 0} onClick={runReject}>
              Secilenleri Reddet
            </button>
            <button className="btn btn--primary" type="button" disabled={submitting || selectedIds.length === 0} onClick={runApprove}>
              Secilenleri Onayla
            </button>
          </div>

          {rows.length === 0 ? (
            <p className="overtime-empty-state">Secilen filtrelere uygun mesai kaydi bulunamadi.</p>
          ) : (
            <div className="overtime-request-list">
              {rows.map((row) => (
                <article className="overtime-request-card" key={row.name}>
                  <div className="overtime-request-card__top">
                    <label className="overtime-approval-check">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.name)}
                        onChange={() => toggleSelected(row.name)}
                      />
                      <strong>{row.employee_name || row.employee || "-"}</strong>
                    </label>
                    <span className="overtime-status overtime-status--warning">{row.status}</span>
                  </div>
                  <div className="overtime-request-card__grid">
                    <p>
                      <span>Tarih</span>
                      {formatDate(row.date)}
                    </p>
                    <p>
                      <span>Saat</span>
                      {row.hours ?? 0}
                    </p>
                    <p>
                      <span>Aciklama</span>
                      {row.reason || "-"}
                    </p>
                    <p>
                      <span>Batch</span>
                      {row.overtime_batch || "-"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
