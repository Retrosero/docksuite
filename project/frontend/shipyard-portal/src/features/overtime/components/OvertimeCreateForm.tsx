import { useState } from "react";
import { createOvertimeRequest } from "../services/overtimeService";
import type { OvertimeCreateInput, OvertimeEmployeeOption } from "../types";

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
  const [form, setForm] = useState<OvertimeCreateInput>({
    employee: activeEmployeeId ?? "",
    date: new Date().toISOString().split("T")[0],
    hours: 2,
    reason: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value =
      target.name === "hours"
        ? Number(target.value)
        : target.type === "checkbox"
          ? (target as HTMLInputElement).checked
          : target.value;

    setForm((prev) => ({ ...prev, [target.name]: value as never }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.employee.trim() || !form.date.trim() || form.hours <= 0) {
      setError("Lutfen zorunlu alanlari doldurun.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createOvertimeRequest(form);
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
            ✕
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
              <span>Personel</span>
              {employeeOptions.length > 0 ? (
                <select
                  name="employee"
                  value={form.employee}
                  onChange={handleChange}
                >
                  <option value="">Personel secin</option>
                  {employeeOptions.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="employee"
                  value={form.employee}
                  onChange={handleChange}
                  placeholder="Employee ID"
                />
              )}
            </label>

            <label>
              <span>Tarih *</span>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
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
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
