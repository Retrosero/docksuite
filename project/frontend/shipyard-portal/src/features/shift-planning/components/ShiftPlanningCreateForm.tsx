import { useEffect, useMemo, useState } from "react";
import { createShiftAssignment } from "../services/shiftPlanningService";
import type { ShiftPlanEmployee, ShiftTypeInfo } from "../types";

type ShiftPlanningCreateFormProps = {
  shiftTypes: ShiftTypeInfo[];
  employees: ShiftPlanEmployee[];
  initialStartDate?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

function formatShiftTypeLabel(type: ShiftTypeInfo) {
  const start = (type.start_time ?? "").trim();
  const end = (type.end_time ?? "").trim();
  if (start && end) return `${type.label} (${start}-${end})`;
  if (start) return `${type.label} (${start})`;
  if (end) return `${type.label} (${end})`;
  return `${type.label} (Saat tanimsiz)`;
}

export function ShiftPlanningCreateForm({
  shiftTypes,
  employees,
  initialStartDate,
  onSuccess,
  onCancel
}: ShiftPlanningCreateFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    employee: "",
    shift_type: "",
    start_date: initialStartDate || today,
    end_date: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasEmployees = employees.length > 0;
  const hasShiftTypes = shiftTypes.length > 0;
  const canSubmit = hasEmployees && hasShiftTypes;

  const helperMessage = useMemo(() => {
    if (!hasEmployees && !hasShiftTypes) {
      return "Kayitli personel ve vardiya tipi bulunamadi. Once personel ve vardiya tipi kaydi olusturun.";
    }
    if (!hasEmployees) {
      return "Kayitli personel bulunamadi. Once personel kaydi olusturun.";
    }
    if (!hasShiftTypes) {
      return "Vardiya tipi bulunamadi. ERPNext HRMS tarafinda Shift Type kaydi olusturmaniz gerekir.";
    }
    return null;
  }, [hasEmployees, hasShiftTypes]);

  useEffect(() => {
    if (!form.employee && employees.length > 0) {
      setForm((prev) => ({ ...prev, employee: employees[0]?.id ?? "" }));
    }
  }, [employees, form.employee]);

  useEffect(() => {
    if (!form.shift_type && shiftTypes.length > 0) {
      setForm((prev) => ({ ...prev, shift_type: shiftTypes[0]?.id ?? "" }));
    }
  }, [shiftTypes, form.shift_type]);

  useEffect(() => {
    if (!initialStartDate) return;
    setForm((prev) => ({ ...prev, start_date: initialStartDate }));
  }, [initialStartDate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!canSubmit) {
      setError(helperMessage ?? "Kayit olusturmak icin gerekli alanlar hazir degil.");
      return;
    }

    if (!form.employee.trim() || !form.shift_type.trim() || !form.start_date.trim()) {
      setError("Lutfen zorunlu alanlari doldurun.");
      return;
    }

    if (form.end_date && form.end_date < form.start_date) {
      setError("Bitis tarihi, baslangic tarihinden once olamaz.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createShiftAssignment({
        employee: form.employee,
        shift_type: form.shift_type,
        start_date: form.start_date,
        end_date: form.end_date || form.start_date
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vardiya atamasi olusturulamadi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shift-plan-create-overlay" onClick={onCancel}>
      <div className="shift-plan-create-modal" onClick={(event) => event.stopPropagation()}>
        <header className="shift-plan-create-modal__header">
          <h3>Yeni Vardiya Plani</h3>
          <button type="button" className="shift-plan-create-modal__close" onClick={onCancel} aria-label="Kapat">
            x
          </button>
        </header>

        {helperMessage ? (
          <div className="form-error">
            <p>{helperMessage}</p>
          </div>
        ) : null}

        {error ? (
          <div className="form-error">
            <p>{error}</p>
          </div>
        ) : null}

        <p className="shift-plan-hint">
          Vardiya tipi listesi ERPNext HRMS icindeki <strong>Shift Type</strong> kayitlarindan otomatik gelir.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="shift-plan-create-form">
            <label>
              <span>Personel *</span>
              <select name="employee" value={form.employee} onChange={handleChange} required disabled={!hasEmployees}>
                <option value="">Personel secin</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Vardiya Tipi *</span>
              <select name="shift_type" value={form.shift_type} onChange={handleChange} required disabled={!hasShiftTypes}>
                <option value="">Vardiya secin</option>
                {shiftTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {formatShiftTypeLabel(type)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Baslangic Tarihi *</span>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
            </label>

            <label>
              <span>Bitis Tarihi</span>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                min={form.start_date || today}
                placeholder="Ayni gun ise bos birakin"
              />
            </label>
          </div>

          <div className="shift-plan-create-form__actions">
            <button type="button" className="btn btn--secondary" onClick={onCancel}>
              Iptal
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading || !canSubmit}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
