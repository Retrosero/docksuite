import { useEffect, useState } from "react";
import { navigateTo } from "../../app/useAppRoute";
import { createZimmet, fetchZimmetCreateOptions } from "../../features/zimmet/services/zimmetService";
import type { ZimmetCreateInput, ZimmetCreateOptions } from "../../features/zimmet/types";

const EMPTY_OPTIONS: ZimmetCreateOptions = {
  employeeOptions: [],
  itemOptions: []
};

export function ZimmetCreatePage() {
  const [form, setForm] = useState<ZimmetCreateInput>({
    employee: "",
    item: "",
    quantity: 1,
    returnStatus: "Teslim Edildi",
    deliveryDate: "",
    notes: ""
  });

  const [createOptions, setCreateOptions] = useState<ZimmetCreateOptions>(EMPTY_OPTIONS);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);

      try {
        const response = await fetchZimmetCreateOptions();
        if (!cancelled) {
          setCreateOptions(response);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target.type === "number" ? parseInt(target.value, 10) || 0 : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.employee.trim() || !form.item.trim() || !form.deliveryDate.trim() || form.quantity <= 0) {
      setError("Lutfen zorunlu alanlari doldurun.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createZimmet(form);
      navigateTo("/zimmet");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayit olusturulamadi.");
    } finally {
      setLoading(false);
    }
  };

  const hasEmployeeOptions = createOptions.employeeOptions.length > 0;
  const hasItemOptions = createOptions.itemOptions.length > 0;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-header__back">
          <button type="button" className="link-button" onClick={() => navigateTo("/zimmet")}>
            Zimmet Listesi
          </button>
        </div>
        <div className="page-header__title">
          <p className="eyebrow">Zimmet Yonetimi</p>
          <h1>Yeni Zimmet Kaydi</h1>
        </div>
      </header>

      {error && (
        <div className="form-error">
          <p>{error}</p>
        </div>
      )}

      <form className="zimmet-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="employee">Personel (Employee) *</label>
            {hasEmployeeOptions ? (
              <select id="employee" name="employee" value={form.employee} onChange={handleChange} required>
                <option value="">Personel secin</option>
                {createOptions.employeeOptions.map((employee) => (
                  <option key={employee} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="employee"
                name="employee"
                value={form.employee}
                onChange={handleChange}
                placeholder="Employee ID"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="item">Malzeme (Item) *</label>
            {hasItemOptions ? (
              <select id="item" name="item" value={form.item} onChange={handleChange} required>
                <option value="">Malzeme secin</option>
                {createOptions.itemOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="item"
                name="item"
                value={form.item}
                onChange={handleChange}
                placeholder="Item ID"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Miktar *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="returnStatus">Iade Durumu</label>
            <select id="returnStatus" name="returnStatus" value={form.returnStatus} onChange={handleChange}>
              <option value="Teslim Edildi">Teslim Edildi</option>
              <option value="Kismi Iade">Kismi Iade</option>
              <option value="Tam Iade">Tam Iade</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="deliveryDate">Teslim Tarihi *</label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={form.deliveryDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group form-group--full">
            <label htmlFor="notes">Not</label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Zimmet ile ilgili notlar..."
              rows={3}
            />
          </div>
        </div>

        {loadingOptions ? <p className="form-hint">Secim listeleri yukleniyor...</p> : null}

        <div className="form-actions">
          <button type="button" className="btn btn--secondary" onClick={() => navigateTo("/zimmet")}>
            Iptal
          </button>
          <button type="submit" className="btn btn--primary" disabled={loading || loadingOptions}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}