import { useState } from "react";
import { navigateTo } from "../../app/useAppRoute";
import { useStockCreateOptions } from "../../features/stock/hooks/useStockData";
import { createStockItem } from "../../features/stock/services/stockService";
import type { StockCreateInput } from "../../features/stock/types";

export function StockCreatePage() {
  const { data: createOptions } = useStockCreateOptions();

  const [form, setForm] = useState<StockCreateInput>({
    itemCode: "",
    itemName: "",
    itemGroup: "",
    barcode: "",
    description: "",
    unit: "",
    isStockItem: true,
    isCriticalStock: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.itemCode.trim() || !form.itemName.trim() || !form.itemGroup.trim()) {
      setError("Lutfen zorunlu alanlari doldurun.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createStockItem(form);
      navigateTo("/stok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayit olusturulamadi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-header__back">
          <button type="button" className="link-button" onClick={() => navigateTo("/stok")}>
            ‹ Stok Listesi
          </button>
        </div>
        <div className="page-header__title">
          <p className="eyebrow">Stok Yonetimi</p>
          <h1>Yeni Stok Kalemi</h1>
        </div>
      </header>

      {error && (
        <div className="form-error">
          <p>{error}</p>
        </div>
      )}

      <form className="stock-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="itemCode">Urun Kodu *</label>
            <input
              type="text"
              id="itemCode"
              name="itemCode"
              value={form.itemCode}
              onChange={handleChange}
              placeholder="URN-001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="itemName">Urun Adi *</label>
            <input
              type="text"
              id="itemName"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              placeholder="Urun adi"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="itemGroup">Urun Grubu *</label>
            <select
              id="itemGroup"
              name="itemGroup"
              value={form.itemGroup}
              onChange={handleChange}
              required
            >
              <option value="">Grup secin</option>
              {(createOptions?.itemGroups ?? []).map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="unit">Birim</label>
            <select
              id="unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
            >
              <option value="">Birim secin (varsayilan: Nos)</option>
              {(createOptions?.uoms ?? []).map((uom) => (
                <option key={uom} value={uom}>
                  {uom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group form-group--full">
            <label htmlFor="barcode">Barkod</label>
            <input
              type="text"
              id="barcode"
              name="barcode"
              value={form.barcode}
              onChange={handleChange}
              placeholder="Barkod numarasi"
            />
          </div>

          <div className="form-group form-group--full">
            <label htmlFor="description">Aciklama</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Urun ile ilgili notlar..."
              rows={3}
            />
          </div>

          <div className="form-group form-group--checkbox">
            <label>
              <input
                type="checkbox"
                name="isStockItem"
                checked={form.isStockItem}
                onChange={handleChange}
              />
              Stoklu urun mu?
            </label>
          </div>

          <div className="form-group form-group--checkbox">
            <label>
              <input
                type="checkbox"
                name="isCriticalStock"
                checked={form.isCriticalStock}
                onChange={handleChange}
              />
              Kritik stok mu?
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => navigateTo("/stok")}
          >
            Iptal
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}