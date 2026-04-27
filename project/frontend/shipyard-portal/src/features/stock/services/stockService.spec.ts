import { describe, expect, it } from "vitest";
import { ErpRequestError } from "../../../lib/erpApi";
import {
  buildStockAuditSummary,
  buildStockKpiSummary,
  buildMaterialRequestDoc,
  buildStockProcurementLinkSummary,
  buildStockReconciliationAnalysis,
  buildStockReconciliationDoc,
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

  it("builds stock reconciliation doc with item and warehouse", () => {
    const doc = buildStockReconciliationDoc({
      itemCode: "ITM-009",
      warehouse: "Ana Depo",
      countedQty: 12.5,
      postingDate: "2026-04-26",
      note: "Sayim fark duzeltmesi"
    });

    expect(doc).toMatchObject({
      doctype: "Stock Reconciliation",
      purpose: "Stock Reconciliation",
      posting_date: "2026-04-26",
      remarks: "Sayim fark duzeltmesi"
    });
    expect(doc.items[0]).toMatchObject({
      item_code: "ITM-009",
      warehouse: "Ana Depo",
      qty: 12.5
    });
  });

  it("builds reconciliation analysis summary and sorts by highest difference", () => {
    const analysis = buildStockReconciliationAnalysis(
      [
        {
          reconciliationId: "SR-0002",
          postingDate: "2026-04-26",
          itemCode: "ITM-002",
          warehouse: "Depo A",
          currentQty: 6,
          currentQtyLabel: "6 adet",
          countedQty: 10,
          countedQtyLabel: "10 adet",
          qtyDifference: 4,
          qtyDifferenceLabel: "+4 adet",
          docStatusLabel: "Onayli"
        },
        {
          reconciliationId: "SR-0001",
          postingDate: "2026-04-25",
          itemCode: "ITM-001",
          warehouse: "Depo B",
          currentQty: 22,
          currentQtyLabel: "22 adet",
          countedQty: 11,
          countedQtyLabel: "11 adet",
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

  it("builds stock audit summary with open and closed counts", () => {
    const summary = buildStockAuditSummary([
      {
        doctype: "Material Request",
        documentId: "MAT-0002",
        actor: "muhendis@tenant.local",
        stateLabel: "Acik",
        stateTone: "open",
        docStatusLabel: "Taslak",
        statusLabel: "Open",
        postingDate: "2026-04-27",
        updatedAt: "2026-04-27 13:05:00"
      },
      {
        doctype: "Stock Reconciliation",
        documentId: "SR-0009",
        actor: "depo@tenant.local",
        stateLabel: "Kapali",
        stateTone: "closed",
        docStatusLabel: "Onayli",
        statusLabel: "Onayli",
        postingDate: "2026-04-26",
        updatedAt: "2026-04-27 13:15:00"
      }
    ]);

    expect(summary.totalEvents).toBe(2);
    expect(summary.openEvents).toBe(1);
    expect(summary.closedEvents).toBe(1);
    expect(summary.uniqueActors).toBe(2);
    expect(summary.rows[0]?.documentId).toBe("SR-0009");
  });

  it("builds procurement summary totals and sorts by open linkage volume", () => {
    const summary = buildStockProcurementLinkSummary([
      {
        itemCode: "ITM-100",
        itemName: "Pompa",
        openMaterialRequestCount: 0,
        openPurchaseOrderCount: 1,
        purchaseReceiptCount: 3,
        lastPurchaseInvoiceId: "PINV-0001",
        lastPurchaseInvoiceDate: "2026-04-20"
      },
      {
        itemCode: "ITM-200",
        itemName: "Valf",
        openMaterialRequestCount: 2,
        openPurchaseOrderCount: 2,
        purchaseReceiptCount: 1,
        lastPurchaseInvoiceId: null,
        lastPurchaseInvoiceDate: null
      }
    ]);

    expect(summary.totalTrackedItems).toBe(2);
    expect(summary.totalOpenMaterialRequests).toBe(2);
    expect(summary.totalOpenPurchaseOrders).toBe(3);
    expect(summary.totalReceipts).toBe(4);
    expect(summary.rows[0]?.itemCode).toBe("ITM-200");
  });

  it("builds stock KPI summary with value impact and trend", () => {
    const summary = buildStockKpiSummary({
      items: [
        {
          id: "ITM-001",
          itemCode: "ITM-001",
          itemName: "Pompa",
          itemGroup: "Yedek",
          barcode: null,
          secondaryAisle: null,
          isCritical: true,
          riskLevel: "critical",
          stockQtyLabel: "8 adet",
          stockQtyValue: 8,
          tone: "critical"
        }
      ],
      warehouseDistribution: [
        {
          warehouse: "Ana Depo",
          totalQty: 30,
          totalQtyLabel: "30 adet",
          itemCount: 5,
          criticalItemCount: 2,
          sharePercent: 65
        }
      ],
      stockValueByItem: new Map([["ITM-001", 1200]]),
      trendByDate: new Map([
        ["2026-04-25", 24],
        ["2026-04-26", 12]
      ])
    });

    expect(summary.totalItems).toBe(1);
    expect(summary.criticalItems).toBe(1);
    expect(summary.lowStockValueImpactLabel).toContain("1.200");
    expect(summary.topWarehouseName).toBe("Ana Depo");
    expect(summary.trend.length).toBe(2);
  });
});
