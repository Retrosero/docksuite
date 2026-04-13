import { useCallback, useEffect, useState } from "react";
import type { StockData, StockFilterState } from "../types";
import { fetchStockData } from "../services/stockService";

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
