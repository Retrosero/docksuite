import { useCallback, useEffect, useState } from "react";
import type {
  StockAuditSummary,
  StockCreateOptions,
  StockData,
  StockFilterState,
  StockKpiSummary,
  StockItem,
  StockProcurementLinkSummary,
  StockTenantHealthSummary,
  StockWarehouseDistribution,
  StockReconciliationAnalysis
} from "../types";
import {
  fetchStockAuditSummary,
  fetchStockCreateOptions,
  fetchStockData,
  fetchStockKpiSummary,
  fetchStockProcurementLinks,
  fetchStockReconciliationAnalysis,
  fetchStockTenantHealthSummary
} from "../services/stockService";

type UseStockDataArgs = {
  filters: StockFilterState;
};

type UseStockDataResult = {
  data: StockData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useStockData({ filters }: UseStockDataArgs): UseStockDataResult {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchStockData(filters);

        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Stok verisi su anda alinamadi. Lutfen tekrar deneyin.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [filters, refreshToken]);

  return {
    data,
    loading,
    error,
    refresh
  };
}

type UseStockGroupsResult = {
  data: string[] | null;
  loading: boolean;
  error: string | null;
};

export function useStockGroups(): UseStockGroupsResult {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchStockData({
          itemGroup: "",
          searchText: "",
          criticalOnly: false
        });

        if (!cancelled) {
          setData(response.itemGroupOptions);
        }
      } catch {
        if (!cancelled) {
          setError("Grup verisi alinamadi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    data,
    loading,
    error
  };
}

type UseStockCreateOptionsResult = {
  data: StockCreateOptions | null;
  loading: boolean;
  error: string | null;
};

export function useStockCreateOptions(): UseStockCreateOptionsResult {
  const [data, setData] = useState<StockCreateOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchStockCreateOptions();

        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Stok olusturma secenekleri alinamadi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    data,
    loading,
    error
  };
}

type UseStockReconciliationAnalysisResult = {
  data: StockReconciliationAnalysis | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

type ToggleArgs = {
  enabled?: boolean;
};

export function useStockReconciliationAnalysis({ enabled = true }: ToggleArgs = {}): UseStockReconciliationAnalysisResult {
  const [data, setData] = useState<StockReconciliationAnalysis | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((previous) => previous + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchStockReconciliationAnalysis();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Sayim fark analizi su anda alinamadi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, refreshToken]);

  return {
    data,
    loading,
    error,
    refresh
  };
}

type UseStockAuditSummaryResult = {
  data: StockAuditSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useStockAuditSummary({ enabled = true }: ToggleArgs = {}): UseStockAuditSummaryResult {
  const [data, setData] = useState<StockAuditSummary | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((previous) => previous + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchStockAuditSummary();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Audit ozeti su anda alinamadi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, refreshToken]);

  return {
    data,
    loading,
    error,
    refresh
  };
}

type UseStockProcurementLinksArgs = {
  itemRows: StockItem[];
  enabled?: boolean;
};

type UseStockProcurementLinksResult = {
  data: StockProcurementLinkSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useStockProcurementLinks({ itemRows, enabled = true }: UseStockProcurementLinksArgs): UseStockProcurementLinksResult {
  const [data, setData] = useState<StockProcurementLinkSummary | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((previous) => previous + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchStockProcurementLinks(itemRows, { forceRefresh: refreshToken > 0 });
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Procurement baglanti ozeti su anda alinamadi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, itemRows, refreshToken]);

  return {
    data,
    loading,
    error,
    refresh
  };
}

type UseStockKpiSummaryArgs = {
  itemRows: StockItem[];
  warehouseDistribution: StockWarehouseDistribution[];
  enabled?: boolean;
};

type UseStockKpiSummaryResult = {
  data: StockKpiSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useStockKpiSummary({
  itemRows,
  warehouseDistribution,
  enabled = true
}: UseStockKpiSummaryArgs): UseStockKpiSummaryResult {
  const [data, setData] = useState<StockKpiSummary | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((previous) => previous + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchStockKpiSummary(itemRows, warehouseDistribution, { forceRefresh: refreshToken > 0 });
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Stock KPI ozeti su anda alinamadi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, itemRows, warehouseDistribution, refreshToken]);

  return {
    data,
    loading,
    error,
    refresh
  };
}

type UseStockTenantHealthSummaryResult = {
  data: StockTenantHealthSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useStockTenantHealthSummary({ enabled = true }: ToggleArgs = {}): UseStockTenantHealthSummaryResult {
  const [data, setData] = useState<StockTenantHealthSummary | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((previous) => previous + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchStockTenantHealthSummary();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Tenant operasyon ozeti su anda alinamadi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [enabled, refreshToken]);

  return { data, loading, error, refresh };
}
