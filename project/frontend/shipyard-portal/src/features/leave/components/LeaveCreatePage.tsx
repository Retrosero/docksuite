import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { navigateTo } from "../../../app/useAppRoute";
import { requestErpJson } from "../../../lib/erpApi";
import { fetchConfiguredLeaveTypes, translateLeaveTypeLabel } from "../services/leaveTrackingService";
import type { LeaveTypeOption } from "../types";

type LeaveApplicationInput = {
  employee: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_leave_days: number;
  description: string;
};

type EmployeeOption = {
  id: string;
  label: string;
};

type EmployeeRow = {
  name?: string;
  employee_name?: string;
  status?: string;
};

type LeaveAllocationRow = {
  name?: string;
  from_date?: string;
  to_date?: string;
  docstatus?: number;
};

async function requestResourceList<T>(doctype: string, params: URLSearchParams): Promise<T[]> {
  const payload = await requestErpJson<{ data?: T[] }>(`/resource/${encodeURIComponent(doctype)}`, params);
  return payload.data ?? [];
}

function calculateTotalDays(fromDate: string, toDate: string) {
  if (!fromDate || !toDate) {
    return 1;
  }

  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }

  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diff);
}

function normalizeDate(value: string) {
  return value.trim();
}

function formatAllocationPeriod(fromDate: string | undefined, toDate: string | undefined) {
  if (!fromDate && !toDate) {
    return "Tahsis dönemi bulunamadi";
  }

  if (fromDate && toDate) {
    return `${fromDate} - ${toDate}`;
  }

  return fromDate || toDate || "Tahsis dönemi bulunamadi";
}

function isDateWithinRange(dateValue: string, fromDate?: string, toDate?: string) {
  if (!dateValue || !fromDate || !toDate) {
    return false;
  }

  return normalizeDate(fromDate) <= normalizeDate(dateValue) && normalizeDate(dateValue) <= normalizeDate(toDate);
}

export function LeaveCreatePage() {
  const [form, setForm] = useState<LeaveApplicationInput>({
    employee: "",
    leave_type: "",
    from_date: "",
    to_date: "",
    total_leave_days: 1,
    description: ""
  });
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [allocationRows, setAllocationRows] = useState<LeaveAllocationRow[]>([]);
  const [allocationLoading, setAllocationLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const [configuredLeaveTypes, leaveTypeRows, employeeRows] = await Promise.all([
          fetchConfiguredLeaveTypes(),
          requestResourceList<{ name?: string }>(
            "Leave Type",
            new URLSearchParams({
              fields: JSON.stringify(["name"]),
              order_by: "name asc",
              limit_page_length: "100"
            })
          ),
          requestResourceList<EmployeeRow>(
            "Employee",
            new URLSearchParams({
              fields: JSON.stringify(["name", "employee_name", "status"]),
              filters: JSON.stringify([["status", "!=", "Left"]]),
              order_by: "employee_name asc",
              limit_page_length: "500"
            })
          )
        ]);

        if (cancelled) {
          return;
        }

        if (configuredLeaveTypes.length > 0) {
          setLeaveTypes(configuredLeaveTypes.map((leaveType) => ({ id: leaveType, label: translateLeaveTypeLabel(leaveType) })));
        } else {
          const leaveTypeNames = leaveTypeRows.map((row) => row.name?.trim()).filter(Boolean) as string[];
          if (leaveTypeNames.length > 0) {
            setLeaveTypes(leaveTypeNames.map((leaveType) => ({ id: leaveType, label: translateLeaveTypeLabel(leaveType) })));
          } else {
            const allocationRows = await requestResourceList<{ leave_type?: string }>(
              "Leave Allocation",
              new URLSearchParams({
                fields: JSON.stringify(["leave_type"]),
                limit_page_length: "100"
              })
            );

            const uniqueLeaveTypes = [...new Set(allocationRows.map((row) => row.leave_type?.trim()).filter(Boolean) as string[])];
            setLeaveTypes(uniqueLeaveTypes.map((leaveType) => ({ id: leaveType, label: translateLeaveTypeLabel(leaveType) })));
          }
        }

        setEmployees(
          employeeRows
            .map((row) => ({
              id: row.name ?? "",
              label: row.employee_name?.trim() || row.name || "-"
            }))
            .filter((row) => row.id.trim().length > 0)
        );
      } catch {
        if (!cancelled) {
          setLeaveTypes([]);
          setEmployees([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAllocations() {
      if (!form.employee.trim() || !form.leave_type.trim()) {
        setAllocationRows([]);
        return;
      }

      setAllocationLoading(true);

      try {
        const rows = await requestResourceList<LeaveAllocationRow>(
          "Leave Allocation",
          new URLSearchParams({
            fields: JSON.stringify(["name", "from_date", "to_date", "docstatus"]),
            filters: JSON.stringify([
              ["employee", "=", form.employee.trim()],
              ["leave_type", "=", form.leave_type.trim()],
              ["docstatus", "=", 1]
            ]),
            order_by: "from_date asc",
            limit_page_length: "20"
          })
        );

        if (!cancelled) {
          setAllocationRows(rows);
        }
      } catch {
        if (!cancelled) {
          setAllocationRows([]);
        }
      } finally {
        if (!cancelled) {
          setAllocationLoading(false);
        }
      }
    }

    void loadAllocations();

    return () => {
      cancelled = true;
    };
  }, [form.employee, form.leave_type]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = event.target;
    const value = target.name === "total_leave_days" ? Number(target.value) || 1 : target.value;

    setForm((prev) => {
      const next = { ...prev, [target.name]: value };

      if (target.name === "from_date" || target.name === "to_date") {
        const nextFromDate = target.name === "from_date" ? String(value) : prev.from_date;
        const nextToDate = target.name === "to_date" ? String(value) : prev.to_date;
        next.total_leave_days = calculateTotalDays(
          nextFromDate,
          nextToDate
        );
      }

      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.employee.trim() || !form.leave_type.trim() || !form.from_date.trim() || !form.to_date.trim()) {
      setError("Lutfen zorunlu alanlari doldurun.");
      return;
    }

    if (form.to_date < form.from_date) {
      setError("Bitis tarihi baslangic tarihinden once olamaz.");
      return;
    }

    const matchedAllocation = allocationRows.find(
      (row) =>
        row.docstatus === 1 &&
        isDateWithinRange(form.from_date, row.from_date, row.to_date) &&
        isDateWithinRange(form.to_date, row.from_date, row.to_date)
    );

    if (!matchedAllocation) {
      const allocationPeriodLabels = allocationRows.map((row) => formatAllocationPeriod(row.from_date, row.to_date)).filter(Boolean);
      setError(
        allocationPeriodLabels.length > 0
          ? `Secilen tarih araligi mevcut izin tahsis dönemi disinda. Gecerli dönem: ${allocationPeriodLabels.join(", ")}.`
          : "Secilen personel ve izin turu icin aktif izin tahsisi bulunamadi. Once Leave Allocation tanimlanmali."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await requestErpJson("/resource/Leave Application", undefined, {
        method: "POST",
        body: {
          doctype: "Leave Application",
          employee: form.employee,
          leave_type: form.leave_type,
          from_date: form.from_date,
          to_date: form.to_date,
          total_leave_days: form.total_leave_days,
          description: form.description,
          status: "Open"
        }
      });

      setSuccess(true);
      setTimeout(() => navigateTo("/izinler"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Izin basvurusu olusturulamadi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-header__back">
          <button type="button" className="link-button" onClick={() => navigateTo("/izinler")}>
            Izin Yonetimi
          </button>
        </div>
        <div className="page-header__title">
          <p className="eyebrow">Izin Yonetimi</p>
          <h1>Yeni Izin Basvurusu</h1>
        </div>
      </header>

      {loadingOptions ? <p className="leave-empty-state">Secenekler yukleniyor...</p> : null}
      {error ? (
        <div className="form-error">
          <p>{error}</p>
        </div>
      ) : null}
      {success ? (
        <div className="form-success">
          <p>Izin basvurusu olusturuldu. Yonlendiriliyorsunuz...</p>
        </div>
      ) : null}

      <form className="leave-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="employee">Personel *</label>
            {employees.length > 0 ? (
              <select id="employee" name="employee" value={form.employee} onChange={handleChange} required>
                <option value="">Personel secin</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="employee"
                name="employee"
                type="text"
                value={form.employee}
                onChange={handleChange}
                placeholder="Personel sicili"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="leave_type">Izin Turu *</label>
            <select id="leave_type" name="leave_type" value={form.leave_type} onChange={handleChange} required>
              <option value="">Izin turu secin</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            {leaveTypes.length === 0 ? <p className="leave-mode-note">Izin turu listesi yuklenemedi. Ayarlar sayfasindan izin turlerini tanimlayin.</p> : null}
          </div>

          <div className="form-group">
            <label htmlFor="from_date">Baslangic Tarihi *</label>
            <input
              type="date"
              id="from_date"
              name="from_date"
              value={form.from_date}
              onChange={handleChange}
              min={allocationRows[0]?.from_date ?? undefined}
              max={allocationRows.at(-1)?.to_date ?? undefined}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="to_date">Bitis Tarihi *</label>
            <input
              type="date"
              id="to_date"
              name="to_date"
              value={form.to_date}
              onChange={handleChange}
              min={allocationRows[0]?.from_date ?? undefined}
              max={allocationRows.at(-1)?.to_date ?? undefined}
              required
            />
            {form.employee && form.leave_type ? (
              <p className="leave-mode-note">
                {allocationLoading
                  ? "Izin tahsis dönemleri kontrol ediliyor..."
                  : allocationRows.length > 0
                    ? `Gecerli tahsis: ${allocationRows.map((row) => formatAllocationPeriod(row.from_date, row.to_date)).join(", ")}`
                    : "Bu personel ve izin turu icin aktif tahsis bulunamadi."}
              </p>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="total_leave_days">Toplam Gun</label>
            <input
              type="number"
              id="total_leave_days"
              name="total_leave_days"
              value={form.total_leave_days}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group form-group--full">
            <label htmlFor="description">Aciklama</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Izin ile ilgili notlar..."
              rows={3}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--secondary" onClick={() => navigateTo("/izinler")}>
            Iptal
          </button>
          <button type="submit" className="btn btn--primary" disabled={loading || loadingOptions}>
            {loading ? "Kaydediliyor..." : "Basvur"}
          </button>
        </div>
      </form>
    </div>
  );
}
