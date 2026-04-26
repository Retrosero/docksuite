import { describe, expect, it } from "vitest";
import { resolveStockRisk } from "./stockRisk";

describe("stockRisk", () => {
  it("returns critical when critical field marks the item", () => {
    const result = resolveStockRisk({
      stockQtyValue: 50,
      hasCriticalField: true,
      criticalByField: true,
      criticalStockLimit: 5
    });

    expect(result).toEqual({
      isCritical: true,
      riskLevel: "critical",
      tone: "critical"
    });
  });

  it("returns critical when stock quantity is at or below limit", () => {
    const result = resolveStockRisk({
      stockQtyValue: 5,
      hasCriticalField: false,
      criticalByField: false,
      criticalStockLimit: 5
    });

    expect(result.riskLevel).toBe("critical");
    expect(result.isCritical).toBe(true);
  });

  it("returns warning when stock is above critical but within warning threshold", () => {
    const result = resolveStockRisk({
      stockQtyValue: 7,
      hasCriticalField: false,
      criticalByField: false,
      criticalStockLimit: 5
    });

    expect(result).toEqual({
      isCritical: false,
      riskLevel: "warning",
      tone: "warning"
    });
  });

  it("returns normal when stock is above warning threshold", () => {
    const result = resolveStockRisk({
      stockQtyValue: 15,
      hasCriticalField: false,
      criticalByField: false,
      criticalStockLimit: 5
    });

    expect(result).toEqual({
      isCritical: false,
      riskLevel: "normal",
      tone: "neutral"
    });
  });

  it("returns unknown when stock quantity is unavailable", () => {
    const result = resolveStockRisk({
      stockQtyValue: null,
      hasCriticalField: false,
      criticalByField: false,
      criticalStockLimit: 5
    });

    expect(result).toEqual({
      isCritical: false,
      riskLevel: "unknown",
      tone: "neutral"
    });
  });
});
