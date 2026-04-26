import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { StockItem, StockMaterialRequestCreateOptions } from "../types";
import {
  createStockMaterialRequest,
  fetchStockMaterialRequestCreateOptions,
  resolveStockOperationErrorMessage
} from "../services/stockService";
import { StockOperationStatusBadges } from "./StockOperationStatusBadges";

type StockMaterialRequestQuickCreateProps = {
  items: StockItem[];
  selectedItemCode: string;
  onSelectedItemCodeChange: (next: string) => void;
  onCreated: () => void;
};

type FormState = {
  qty: string;
  scheduleDate: string;
  warehouse: string;
  note: string;
};

const EMPTY_OPTIONS: StockMaterialRequestCreateOptions = {
  canCreate: false,
  warehouses: []
};

function toTodayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function StockMaterialRequestQuickCreate({
  items,
  selectedItemCode,
  onSelectedItemCodeChange,
  onCreated
}: StockMaterialRequestQuickCreateProps) {
  const [options, setOptions] = useState<StockMaterialRequestCreateOptions>(EMPTY_OPTIONS);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSuccessId, setLastSuccessId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    qty: "1",
    scheduleDate: toTodayInputValue(),
    warehouse: "",
    note: ""
  });

  const selectedItem = useMemo(() => items.find((row) => row.itemCode === selectedItemCode) ?? null, [items, selectedItemCode]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingOptions(true);
      try {
        const response = await fetchStockMaterialRequestCreateOptions();
        if (!cancelled) {
          setOptions(response);
        }
      } catch {
        if (!cancelled) {
          setOptions(EMPTY_OPTIONS);
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedItemCode && items.length > 0) {
      onSelectedItemCodeChange(items[0]?.itemCode ?? "");
    }
  }, [items, onSelectedItemCodeChange, selectedItemCode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedItem) {
      setError("Talep olusturmak icin bir urun secin.");
      return;
    }

    const qty = Number(form.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Talep miktari sifirdan buyuk olmali.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const requestId = await createStockMaterialRequest({
        itemCode: selectedItem.itemCode,
        qty,
        scheduleDate: form.scheduleDate,
        warehouse: form.warehouse.trim().length > 0 ? form.warehouse.trim() : null,
        note: form.note
      });
      setLastSuccessId(requestId);
      setForm((previous) => ({
        ...previous,
        qty: "1",
        note: ""
      }));
      onCreated();
    } catch (caughtError) {
      setError(resolveStockOperationErrorMessage(caughtError, "material-request"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel stock-panel stock-panel--request" aria-label="Malzeme talep olusturma">
      <div className="stock-request-header">
        <h3>Hizli Malzeme Talebi</h3>
        <p>Stok kartindan secilen urun icin tek adimda Material Request olusturur.</p>
      </div>

      <StockOperationStatusBadges
        title="Material Request"
        saving={saving}
        lastSuccessId={lastSuccessId}
        errorMessage={error}
      />
      {lastSuccessId ? <p className="stock-request-message stock-request-message--success">Talep olusturuldu: {lastSuccessId}</p> : null}
      {error ? <p className="stock-request-message stock-request-message--error">{error}</p> : null}
      {!options.canCreate && !loadingOptions ? (
        <p className="stock-request-message">Bu tenant'ta Material Request erisimi bulunmuyor.</p>
      ) : null}

      <form className="stock-request-form" onSubmit={handleSubmit}>
        <label>
          <span>Urun</span>
          <select
            value={selectedItemCode}
            onChange={(event) => {
              onSelectedItemCodeChange(event.target.value);
            }}
            disabled={saving || items.length === 0}
          >
            {items.length === 0 ? <option value="">Urun bulunamadi</option> : null}
            {items.map((row) => (
              <option key={row.id} value={row.itemCode}>
                {row.itemCode} - {row.itemName}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Miktar</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={form.qty}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                qty: event.target.value
              }));
            }}
            disabled={saving}
          />
        </label>

        <label>
          <span>Ihtiyac tarihi</span>
          <input
            type="date"
            value={form.scheduleDate}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                scheduleDate: event.target.value
              }));
            }}
            disabled={saving}
          />
        </label>

        <label>
          <span>Hedef depo (opsiyonel)</span>
          <select
            value={form.warehouse}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                warehouse: event.target.value
              }));
            }}
            disabled={saving || loadingOptions}
          >
            <option value="">Depo seciniz</option>
            {options.warehouses.map((row) => (
              <option key={row} value={row}>
                {row}
              </option>
            ))}
          </select>
        </label>

        <label className="stock-request-form__note">
          <span>Not (opsiyonel)</span>
          <textarea
            value={form.note}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                note: event.target.value
              }));
            }}
            placeholder="Talep gerekcesini yazin"
            rows={3}
            disabled={saving}
          />
        </label>

        <div className="stock-request-actions">
          <button type="submit" disabled={saving || loadingOptions || !options.canCreate || !selectedItem}>
            {saving ? "Talep olusturuluyor..." : "Material Request Olustur"}
          </button>
        </div>
      </form>
    </section>
  );
}
