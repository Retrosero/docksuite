import { describe, expect, it } from "vitest";
import { ErpRequestError } from "../../../lib/erpApi";
import {
  buildMaterialRequestDoc,
  buildStockReconciliationAnalysis,
  buildStockTransferDoc,
  resolveStockOperationErrorMessage
} from "./stockService";

describe("stockService doc builders", () => {
  it("builds purchase material request doc with optional warehouse and note", () => {
    const doc = buildMaterialRequestDoc({
      itemCode: "ITM-001",
      qty: 3,
      scheduleDate: "2026-04-26",
      warehouse: "Ana Depo",
      note: "Acil ihtiyac"
    });

    expect(doc).toMatchObject({
      doctype: "Material Request",
      material_request_type: "Purchase",
      transaction_date: "2026-04-26",
      schedule_date: "2026-04-26",
      notes: "Acil ihtiyac"
    });
    expect(Array.isArray(doc.items)).toBe(true);
  });

  it("builds stock entry transfer doc with source and target warehouses", () => {
    const doc = buildStockTransferDoc({
      itemCode: "ITM-001",
      qty: 2,
      postingDate: "2026-04-26",
      sourceWarehouse: "Kaynak Depo",
      targetWarehouse: "Hedef Depo",
      note: "Saha transferi"
    });

    expect(doc).toMatchObject({
      doctype: "Stock Entry",
      purpose: "Material Transfer",
      posting_date: "2026-04-26",
      from_warehouse: "Kaynak Depo",
      to_warehouse: "Hedef Depo",
      remarks: "Saha transferi"
    });
    expect(Array.isArray(doc.items)).toBe(true);
    expect(doc.items[0]).toMatchObject({
      item_code: "ITM-001",
      qty: 2,
      s_warehouse: "Kaynak Depo",
      t_warehouse: "Hedef Depo"
    });
  });

  it("maps authorization errors to a clear operation message", () => {
    const error = new ErpRequestError("forbidden", 403);
    const message = resolveStockOperationErrorMessage(error, "material-request");
    expect(message).toBe("Bu islem icin yetkiniz bulunmuyor.");
  });

  it("maps timeout errors to retry guidance", () => {
    const error = new ErpRequestError("timeout", 408);
    const message = resolveStockOperationErrorMessage(error, "stock-transfer");
    expect(message).toBe("ERPNext istegi zaman asimina ugradi. Tekrar deneyin.");
  });

  it("builds reconciliation analysis summary and sorts by highest difference", () => {
    const analysis = buildStockReconciliationAnalysis(
      [
        {
          reconciliationId: "SR-0002",
          postingDate: "2026-04-26",
          itemCode: "ITM-002",
          warehouse: "Depo A",
          qtyDifference: 4,
          qtyDifferenceLabel: "+4 adet",
          docStatusLabel: "Onayli"
        },
        {
          reconciliationId: "SR-0001",
          postingDate: "2026-04-25",
          itemCode: "ITM-001",
          warehouse: "Depo B",
          qtyDifference: -11,
          qtyDifferenceLabel: "-11 adet",
          docStatusLabel: "Taslak"
        }
      ],
      5
    );

    expect(analysis.totalRows).toBe(2);
    expect(analysis.criticalDifferenceCount).toBe(1);
    expect(analysis.totalAbsDifferenceLabel).toBe("15 adet");
    expect(analysis.rows[0]?.reconciliationId).toBe("SR-0001");
  });
});
