import { useCallback, useEffect, useState } from "react";
import { fetchHrPerformanceData } from "../services/hrPerformanceService";
import type { HrPerformanceData } from "../types";

type UseHrPerformanceDataResult = {
  data: HrPerformanceData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useHrPerformanceData(): UseHrPerformanceDataResult {
  const [data, setData] = useState<HrPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchHrPerformanceData();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Performans verisi su anda alinamadi. Yetki ve backend erisimini kontrol edin.");
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
