import type { StockCardTone, StockRiskLevel } from "../types";

export type ResolveStockRiskArgs = {
  stockQtyValue: number | null;
  hasCriticalField: boolean;
  criticalByField: boolean;
  criticalStockLimit: number;
  warningMultiplier?: number;
};

export type StockRiskResult = {
  isCritical: boolean;
  riskLevel: StockRiskLevel;
  tone: StockCardTone;
};

export function resolveStockRisk(args: ResolveStockRiskArgs): StockRiskResult {
  const { stockQtyValue, hasCriticalField, criticalByField, criticalStockLimit, warningMultiplier = 1.5 } = args;

  if (criticalByField) {
    return {
      isCritical: true,
      riskLevel: "critical",
      tone: "critical"
    };
  }

  if (stockQtyValue === null || !Number.isFinite(stockQtyValue)) {
    return {
      isCritical: false,
      riskLevel: "unknown",
      tone: "neutral"
    };
  }

  const safeCriticalLimit = Math.max(1, Math.floor(criticalStockLimit));
  const safeWarningMultiplier = Math.max(1.1, Math.min(5, warningMultiplier));
  const warningLimit = Math.max(safeCriticalLimit + 1, Math.ceil(safeCriticalLimit * safeWarningMultiplier));

  if (stockQtyValue <= safeCriticalLimit) {
    return {
      isCritical: true,
      riskLevel: "critical",
      tone: "critical"
    };
  }

  if (stockQtyValue <= warningLimit) {
    return {
      isCritical: false,
      riskLevel: "warning",
      tone: "warning"
    };
  }

  return {
    isCritical: false,
    riskLevel: "normal",
    tone: "neutral"
  };
}
