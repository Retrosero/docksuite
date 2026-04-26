import { useCallback, useEffect, useState } from "react";
import type { StockCreateOptions, StockData, StockFilterState, StockReconciliationAnalysis } from "../types";
import { fetchStockCreateOptions, fetchStockData, fetchStockReconciliationAnalysis } from "../services/stockService";

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

export function useStockReconciliationAnalysis(): UseStockReconciliationAnalysisResult {
  const [data, setData] = useState<StockReconciliationAnalysis | null>(null);
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
  }, [refreshToken]);

  return {
    data,
    loading,
    error,
    refresh
  };
}
