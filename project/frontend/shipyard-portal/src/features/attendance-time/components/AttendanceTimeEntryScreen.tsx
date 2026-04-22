import { useEffect, useMemo, useState } from "react";
import {
  fetchAttendanceTimeEmployeeOptions,
  fetchMonthlyPayrollPreview,
  saveBulkAttendanceTimes
} from "../services/attendanceTimeService";
import type { AttendanceTimeEmployeeOption, MonthlyPayrollPreview } from "../types";

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
}

export function AttendanceTimeEntryScreen() {
  const [employeeOptions, setEmployeeOptions] = useState<AttendanceTimeEmployeeOption[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(getTodayDate());
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [status, setStatus] = useState("Present");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [saveLoading, setSaveLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<MonthlyPayrollPreview | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEmployees() {
      try {
        const rows = await fetchAttendanceTimeEmployeeOptions();
        if (!cancelled) {
          setEmployeeOptions(rows);
        }
      } catch {
        if (!cancelled) {
          setError("Personel listesi alinamadi.");
        }
      }
    }

    void loadEmployees();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCount = selectedEmployeeIds.length;

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }, []);

  async function handleSave(mode: "in" | "out" | "both") {
    if (selectedEmployeeIds.length === 0) {
      setError("En az bir personel secin.");
      return;
    }

    if (mode === "in" && !inTime) {
      setError("Giris saati zorunludur.");
      return;
    }
    if (mode === "out" && !outTime) {
      setError("Cikis saati zorunludur.");
      return;
    }
    if (mode === "both" && !inTime && !outTime) {
      setError("Giris veya cikis saati girin.");
      return;
    }

    setError(null);
    setMessage(null);
    setSaveLoading(true);

    try {
      const result = await saveBulkAttendanceTimes({
        employeeIds: selectedEmployeeIds,
        attendanceDate,
        inTime: mode === "out" ? undefined : inTime || undefined,
        outTime: mode === "in" ? undefined : outTime || undefined,
        status
      });

      setMessage(
        `Islem tamamlandi: ${result.created_count} yeni, ${result.updated_count} guncellendi, ${result.failed_count} hata, ${result.skipped_count} atlandi.`
      );
    } catch (saveError) {
      const fallback = "Saat kaydi yapilamadi.";
      setError(saveError instanceof Error && saveError.message ? saveError.message : fallback);
    } finally {
      setSaveLoading(false);
    }
  }

  async function handlePreview() {
    setError(null);
    setMessage(null);
    setPreviewLoading(true);
    setPreview(null);

    try {
      const result = await fetchMonthlyPayrollPreview(year, month, selectedEmployeeIds);
      setPreview(result);
    } catch (previewError) {
      const fallback = "Aylik maas onizleme alinamadi.";
      setError(previewError instanceof Error && previewError.message ? previewError.message : fallback);
    } finally {
      setPreviewLoading(false);
    }
  }

  return (
    <div className="attendance-time-stack">
      <section className="screen-card">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Attendance Giris/Cikis</p>
            <h3>Toplu Mesai Saat Girisi</h3>
          </div>
        </div>

        <div className="attendance-time-grid">
          <label className="attendance-time-control">
            <span>Tarih</span>
            <input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} />
          </label>

          <label className="attendance-time-control">
            <span>Giris Saati</span>
            <input type="time" value={inTime} onChange={(event) => setInTime(event.target.value)} />
          </label>

          <label className="attendance-time-control">
            <span>Cikis Saati</span>
            <input type="time" value={outTime} onChange={(event) => setOutTime(event.target.value)} />
          </label>

          <label className="attendance-time-control">
            <span>Durum</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="Present">Present</option>
              <option value="Half Day">Half Day</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </label>
        </div>

        <label className="attendance-time-control attendance-time-control--full">
          <span>Personeller ({selectedCount} secili)</span>
          <select
            multiple
            size={10}
            value={selectedEmployeeIds}
            onChange={(event) => {
              const values = Array.from(event.target.selectedOptions).map((option) => option.value);
              setSelectedEmployeeIds(values);
            }}
          >
            {employeeOptions.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>

        <div className="attendance-time-actions">
          <button className="btn btn--secondary" disabled={saveLoading} onClick={() => void handleSave("in")} type="button">
            {saveLoading ? "Kaydediliyor..." : "Sadece Giris Kaydet"}
          </button>
          <button className="btn btn--secondary" disabled={saveLoading} onClick={() => void handleSave("out")} type="button">
            {saveLoading ? "Kaydediliyor..." : "Sadece Cikis Kaydet"}
          </button>
          <button className="btn btn--primary" disabled={saveLoading} onClick={() => void handleSave("both")} type="button">
            {saveLoading ? "Kaydediliyor..." : "Giris + Cikis Kaydet"}
          </button>
        </div>

        {message ? <p className="attendance-time-message attendance-time-message--success">{message}</p> : null}
        {error ? <p className="attendance-time-message attendance-time-message--error">{error}</p> : null}
      </section>

      <section className="screen-card">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Ay Sonu Hesap</p>
            <h3>Saat Bazli Maas Onizleme</h3>
          </div>
        </div>

        <div className="attendance-time-grid attendance-time-grid--compact">
          <label className="attendance-time-control">
            <span>Yil</span>
            <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
              {yearOptions.map((row) => (
                <option key={row} value={row}>
                  {row}
                </option>
              ))}
            </select>
          </label>

          <label className="attendance-time-control">
            <span>Ay</span>
            <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((row) => (
                <option key={row} value={row}>
                  {new Intl.DateTimeFormat("tr-TR", { month: "long" }).format(new Date(year, row - 1, 1))}
                </option>
              ))}
            </select>
          </label>

          <button className="btn btn--primary attendance-time-preview-btn" disabled={previewLoading} onClick={() => void handlePreview()} type="button">
            {previewLoading ? "Hesaplaniyor..." : "Maas Onizleme Hesapla"}
          </button>
        </div>

        {preview ? (
          <div className="attendance-time-preview">
            <p className="attendance-time-preview-summary">
              Toplam {preview.totals.employee_count} personel, {formatNumber(preview.totals.total_hours)} saat,{" "}
              {formatCurrency(preview.totals.estimated_total_earnings)} tahmini brut.
            </p>

            <div className="attendance-time-table-wrap">
              <table className="attendance-time-table">
                <thead>
                  <tr>
                    <th>Personel</th>
                    <th>Gun</th>
                    <th>Saat</th>
                    <th>Mesai Saat</th>
                    <th>Temel Maas</th>
                    <th>Mesai Odemesi</th>
                    <th>Tahmini Brut</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={row.employee}>
                      <td>{row.employee_name}</td>
                      <td>{formatNumber(row.attendance_days)}</td>
                      <td>{formatNumber(row.total_hours)}</td>
                      <td>{formatNumber(row.overtime_hours)}</td>
                      <td>{formatCurrency(row.base_salary)}</td>
                      <td>{formatCurrency(row.overtime_pay)}</td>
                      <td>{formatCurrency(row.estimated_total_earnings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
