import { describe, expect, it } from "vitest";
import { buildMaterialRequestDoc, buildStockTransferDoc } from "./stockService";

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
});
