import { useCallback, useEffect, useState } from "react";
import type { ZimmetData, ZimmetFilterState } from "../types";
import { fetchZimmetData } from "../services/zimmetService";

type UseZimmetDataResult = {
  data: ZimmetData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useZimmetData(filters: ZimmetFilterState): UseZimmetDataResult {
  const [data, setData] = useState<ZimmetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchZimmetData(filters);

        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Zimmet verisi şu anda alınamadı. Lütfen tekrar deneyin.");
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