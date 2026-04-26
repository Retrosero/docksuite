import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { StockItem, StockTransferCreateOptions } from "../types";
import {
  createStockTransferEntry,
  fetchStockTransferCreateOptions,
  resolveStockOperationErrorMessage
} from "../services/stockService";
import { StockOperationStatusBadges } from "./StockOperationStatusBadges";

type StockTransferQuickCreateProps = {
  items: StockItem[];
  selectedItemCode: string;
  onSelectedItemCodeChange: (next: string) => void;
  onCreated: () => void;
};

type TransferFormState = {
  qty: string;
  postingDate: string;
  sourceWarehouse: string;
  targetWarehouse: string;
  note: string;
};

const EMPTY_OPTIONS: StockTransferCreateOptions = {
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

export function StockTransferQuickCreate({
  items,
  selectedItemCode,
  onSelectedItemCodeChange,
  onCreated
}: StockTransferQuickCreateProps) {
  const [options, setOptions] = useState<StockTransferCreateOptions>(EMPTY_OPTIONS);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSuccessId, setLastSuccessId] = useState<string | null>(null);
  const [form, setForm] = useState<TransferFormState>({
    qty: "1",
    postingDate: toTodayInputValue(),
    sourceWarehouse: "",
    targetWarehouse: "",
    note: ""
  });

  const selectedItem = useMemo(() => items.find((row) => row.itemCode === selectedItemCode) ?? null, [items, selectedItemCode]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingOptions(true);
      try {
        const response = await fetchStockTransferCreateOptions();
        if (!cancelled) {
          setOptions(response);
          setForm((previous) => {
            if (previous.sourceWarehouse || response.warehouses.length === 0) {
              return previous;
            }
            return {
              ...previous,
              sourceWarehouse: response.warehouses[0] ?? "",
              targetWarehouse: response.warehouses[1] ?? response.warehouses[0] ?? ""
            };
          });
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
      setError("Transfer olusturmak icin bir urun secin.");
      return;
    }

    const qty = Number(form.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Transfer miktari sifirdan buyuk olmali.");
      return;
    }

    if (!form.sourceWarehouse.trim() || !form.targetWarehouse.trim()) {
      setError("Kaynak ve hedef depo secilmelidir.");
      return;
    }

    if (form.sourceWarehouse.trim() === form.targetWarehouse.trim()) {
      setError("Kaynak ve hedef depo ayni olamaz.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const entryId = await createStockTransferEntry({
        itemCode: selectedItem.itemCode,
        qty,
        postingDate: form.postingDate,
        sourceWarehouse: form.sourceWarehouse,
        targetWarehouse: form.targetWarehouse,
        note: form.note
      });
      setLastSuccessId(entryId);
      setForm((previous) => ({
        ...previous,
        qty: "1",
        note: ""
      }));
      onCreated();
    } catch (caughtError) {
      setError(resolveStockOperationErrorMessage(caughtError, "stock-transfer"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel stock-panel stock-panel--transfer" aria-label="Depo transfer olusturma">
      <div className="stock-transfer-header">
        <h3>Hizli Depo Transferi</h3>
        <p>Secilen urun icin Stock Entry (Material Transfer) olusturur.</p>
      </div>

      <StockOperationStatusBadges
        title="Stock Entry"
        saving={saving}
        lastSuccessId={lastSuccessId}
        errorMessage={error}
      />
      {lastSuccessId ? <p className="stock-transfer-message stock-transfer-message--success">Transfer olusturuldu: {lastSuccessId}</p> : null}
      {error ? <p className="stock-transfer-message stock-transfer-message--error">{error}</p> : null}
      {!options.canCreate && !loadingOptions ? (
        <p className="stock-transfer-message">Bu tenant'ta Stock Entry erisimi bulunmuyor.</p>
      ) : null}

      <form className="stock-transfer-form" onSubmit={handleSubmit}>
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
          <span>Transfer tarihi</span>
          <input
            type="date"
            value={form.postingDate}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                postingDate: event.target.value
              }));
            }}
            disabled={saving}
          />
        </label>

        <label>
          <span>Kaynak depo</span>
          <select
            value={form.sourceWarehouse}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                sourceWarehouse: event.target.value
              }));
            }}
            disabled={saving || loadingOptions}
          >
            <option value="">Kaynak depo seciniz</option>
            {options.warehouses.map((row) => (
              <option key={row} value={row}>
                {row}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Hedef depo</span>
          <select
            value={form.targetWarehouse}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                targetWarehouse: event.target.value
              }));
            }}
            disabled={saving || loadingOptions}
          >
            <option value="">Hedef depo seciniz</option>
            {options.warehouses.map((row) => (
              <option key={row} value={row}>
                {row}
              </option>
            ))}
          </select>
        </label>

        <label className="stock-transfer-form__note">
          <span>Not (opsiyonel)</span>
          <textarea
            value={form.note}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                note: event.target.value
              }));
            }}
            placeholder="Transfer aciklamasi"
            rows={3}
            disabled={saving}
          />
        </label>

        <div className="stock-transfer-actions">
          <button type="submit" disabled={saving || loadingOptions || !options.canCreate || !selectedItem}>
            {saving ? "Transfer olusturuluyor..." : "Stock Entry Olustur"}
          </button>
        </div>
      </form>
    </section>
  );
}
