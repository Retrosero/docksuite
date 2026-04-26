import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { StockItem, StockReconciliationCreateOptions } from "../types";
import {
  createStockReconciliationEntry,
  fetchStockReconciliationCreateOptions,
  resolveStockOperationErrorMessage
} from "../services/stockService";
import { StockOperationStatusBadges } from "./StockOperationStatusBadges";

type ReconciliationSeed = {
  itemCode: string;
  warehouse: string;
  countedQty: number;
} | null;

type StockReconciliationQuickCreateProps = {
  items: StockItem[];
  selectedItemCode: string;
  onSelectedItemCodeChange: (itemCode: string) => void;
  selectedSeed: ReconciliationSeed;
  onCreated: () => void;
};

type FormState = {
  countedQty: string;
  postingDate: string;
  warehouse: string;
  note: string;
};

function toTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function StockReconciliationQuickCreate({
  items,
  selectedItemCode,
  onSelectedItemCodeChange,
  selectedSeed,
  onCreated
}: StockReconciliationQuickCreateProps) {
  const [options, setOptions] = useState<StockReconciliationCreateOptions>({
    canCreate: false,
    warehouses: []
  });
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSuccessId, setLastSuccessId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    countedQty: "0",
    postingDate: toTodayInputValue(),
    warehouse: "",
    note: ""
  });

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const next = await fetchStockReconciliationCreateOptions();
        if (!cancelled) {
          setOptions(next);
          setForm((previous) => ({
            ...previous,
            warehouse: previous.warehouse || next.warehouses[0] || ""
          }));
        }
      } catch {
        if (!cancelled) {
          setOptions({
            canCreate: false,
            warehouses: []
          });
          setError("Sayim duzeltme secenekleri alinamadi.");
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
    if (!selectedSeed) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      warehouse: selectedSeed.warehouse,
      countedQty: String(selectedSeed.countedQty)
    }));
    onSelectedItemCodeChange(selectedSeed.itemCode);
  }, [selectedSeed, onSelectedItemCodeChange]);

  const canSubmit = useMemo(() => {
    if (!options.canCreate) {
      return false;
    }
    if (selectedItemCode.trim().length === 0) {
      return false;
    }
    if (form.warehouse.trim().length === 0) {
      return false;
    }
    const qty = Number(form.countedQty);
    if (!Number.isFinite(qty) || qty < 0) {
      return false;
    }
    return true;
  }, [form.countedQty, form.warehouse, options.canCreate, selectedItemCode]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setError("Lutfen urun, depo ve sayim miktari alanlarini kontrol edin.");
      return;
    }

    setSaving(true);
    setError(null);

    void (async () => {
      try {
        const reconciliationId = await createStockReconciliationEntry({
          itemCode: selectedItemCode,
          warehouse: form.warehouse.trim(),
          countedQty: Number(form.countedQty),
          postingDate: form.postingDate,
          note: form.note
        });
        setLastSuccessId(reconciliationId);
        setForm((previous) => ({
          ...previous,
          note: ""
        }));
        onCreated();
      } catch (caughtError) {
        setError(resolveStockOperationErrorMessage(caughtError, "stock-reconciliation"));
      } finally {
        setSaving(false);
      }
    })();
  }

  return (
    <section className="stock-panel stock-panel--reconciliation-create" aria-label="Sayim duzeltme olustur">
      <div className="stock-reconciliation-create-header">
        <h3>Sayim Duzeltme Ac</h3>
        <p>Secili urun ve depo icin Stock Reconciliation taslagi olusturur.</p>
      </div>

      <StockOperationStatusBadges
        title="Stock Reconciliation"
        saving={saving}
        lastSuccessId={lastSuccessId}
        errorMessage={error}
      />
      {lastSuccessId ? (
        <p className="stock-reconciliation-create-message stock-reconciliation-create-message--success">
          Sayim duzeltme olusturuldu: {lastSuccessId}
        </p>
      ) : null}
      {error ? <p className="stock-reconciliation-create-message stock-reconciliation-create-message--error">{error}</p> : null}
      {!options.canCreate && !loadingOptions ? (
        <p className="stock-reconciliation-create-message">Bu tenant'ta Stock Reconciliation erisimi bulunmuyor.</p>
      ) : null}

      <form className="stock-reconciliation-create-form" onSubmit={handleSubmit}>
        <label>
          <span>Urun</span>
          <select
            value={selectedItemCode}
            onChange={(event) => {
              onSelectedItemCodeChange(event.target.value);
            }}
            disabled={loadingOptions || saving}
          >
            <option value="">Urun seciniz</option>
            {items.map((item) => (
              <option key={item.id} value={item.itemCode}>
                {item.itemName} ({item.itemCode})
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Depo</span>
          <select
            value={form.warehouse}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                warehouse: event.target.value
              }));
            }}
            disabled={loadingOptions || saving}
          >
            {options.warehouses.map((warehouse) => (
              <option key={warehouse} value={warehouse}>
                {warehouse}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Sayim miktari</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.countedQty}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                countedQty: event.target.value
              }));
            }}
            disabled={loadingOptions || saving}
          />
        </label>

        <label>
          <span>Tarih</span>
          <input
            type="date"
            value={form.postingDate}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                postingDate: event.target.value
              }));
            }}
            disabled={loadingOptions || saving}
          />
        </label>

        <label className="stock-reconciliation-create-form__note">
          <span>Not</span>
          <textarea
            value={form.note}
            onChange={(event) => {
              setForm((previous) => ({
                ...previous,
                note: event.target.value
              }));
            }}
            disabled={loadingOptions || saving}
            rows={3}
            placeholder="Opsiyonel aciklama"
          />
        </label>

        <div className="stock-reconciliation-create-actions">
          <button type="submit" disabled={loadingOptions || saving || !canSubmit}>
            {saving ? "Olusturuluyor..." : "Duzeltme Olustur"}
          </button>
        </div>
      </form>
    </section>
  );
}
