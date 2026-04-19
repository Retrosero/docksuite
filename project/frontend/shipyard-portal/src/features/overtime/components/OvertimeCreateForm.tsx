import { useEffect, useMemo, useState } from "react";
import { createBulkOvertimeRequests } from "../services/overtimeService";
import type { OvertimeEmployeeOption } from "../types";
import { fetchOperationalSettings } from "../../tenant-settings/services/tenantSettingsService";

type OvertimeCreateFormProps = {
  employeeOptions: OvertimeEmployeeOption[];
  activeEmployeeId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function OvertimeCreateForm({
  employeeOptions,
  activeEmployeeId,
  onSuccess,
  onCancel
}: OvertimeCreateFormProps) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    hours: 2,
    reason: ""
  });
  const [searchText, setSearchText] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(activeEmployeeId ? [activeEmployeeId] : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDefaults() {
      try {
        const settings = await fetchOperationalSettings();
        if (!cancelled) {
          setForm((previous) => ({
            ...previous,
            hours: settings.overtimeDefaultHours
          }));
        }
      } catch {
        // Keep local defaults when settings endpoint is unavailable.
      }
    }

    void loadDefaults();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeEmployeeId) {
      return;
    }
    if (!employeeOptions.some((employee) => employee.id === activeEmployeeId)) {
      return;
    }
    setSelectedEmployeeIds((previous) => (previous.includes(activeEmployeeId) ? previous : [activeEmployeeId]));
  }, [activeEmployeeId, employeeOptions]);

  const filteredOptions = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) {
      return employeeOptions;
    }

    return employeeOptions.filter((employee) => {
      return employee.label.toLowerCase().includes(query) || employee.id.toLowerCase().includes(query);
    });
  }, [employeeOptions, searchText]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target.name === "hours" ? Number(target.value) : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value as never }));
  };

  function toggleEmployee(id: string) {
    setSelectedEmployeeIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((row) => row !== id);
      }
      return [...previous, id];
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedEmployeeIds = selectedEmployeeIds;

    if (resolvedEmployeeIds.length === 0 || !form.date.trim() || form.hours <= 0) {
      setError("Lutfen zorunlu alanlari doldurun.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createBulkOvertimeRequests({
        employeeIds: resolvedEmployeeIds,
        date: form.date,
        hours: form.hours,
        reason: form.reason
      });

      if (result.failed_count > 0 && result.created_count === 0) {
        const firstError = result.failed_rows[0]?.message;
        throw new Error(firstError || "Mesai kaydi olusturulamadi.");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mesai kaydi olusturulamadi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overtime-create-overlay" onClick={onCancel}>
      <div className="overtime-create-modal" onClick={(e) => e.stopPropagation()}>
        <header className="overtime-create-modal__header">
          <h3>Yeni Mesai Girisi</h3>
          <button type="button" className="overtime-create-modal__close" onClick={onCancel}>
            x
          </button>
        </header>

        {error && (
          <div className="form-error">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="overtime-create-form">
            <label>
              <span>Personel *</span>
              <div className="overtime-employee-picker">
                <div className="overtime-employee-picker__header">
                  <input
                    type="search"
                    placeholder="Personel ara..."
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                  />
                  <div className="overtime-employee-picker__actions">
                    <button
                      type="button"
                      onClick={() => setSelectedEmployeeIds(filteredOptions.map((employee) => employee.id))}
                      disabled={employeeOptions.length === 0}
                    >
                      Tumunu sec
                    </button>
                    <button type="button" onClick={() => setSelectedEmployeeIds([])} disabled={employeeOptions.length === 0}>
                      Temizle
                    </button>
                  </div>
                </div>

                <p className="overtime-employee-picker__selected">{selectedEmployeeIds.length} personel secildi</p>

                {employeeOptions.length === 0 ? (
                  <p className="overtime-empty-state">Personel listesi su anda yuklenemedi.</p>
                ) : (
                  <div className="overtime-employee-picker__list">
                    {filteredOptions.map((employee) => {
                      const isSelected = selectedEmployeeIds.includes(employee.id);
                      return (
                        <label key={employee.id} className={`overtime-employee-option${isSelected ? " is-selected" : ""}`}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleEmployee(employee.id)} />
                          <span>{employee.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                </div>
            </label>

            <label>
              <span>Tarih *</span>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
            </label>

            <label>
              <span>Saat *</span>
              <input
                type="number"
                name="hours"
                value={form.hours}
                onChange={handleChange}
                min="0.5"
                max="24"
                step="0.5"
                required
              />
            </label>

            <label className="label--full">
              <span>Aciklama</span>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Mesai sebebi..."
                rows={3}
              />
            </label>
          </div>

          <div className="overtime-create-form__actions">
            <button type="button" className="btn btn--secondary" onClick={onCancel}>
              Iptal
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Toplu Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
