import { useCallback, useEffect, useState } from "react";
import { fetchHrExpenseData } from "../services/hrExpenseService";
import type { HrExpenseData } from "../types";

type UseHrExpenseDataResult = {
  data: HrExpenseData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useHrExpenseData(): UseHrExpenseDataResult {
  const [data, setData] = useState<HrExpenseData | null>(null);
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
        const response = await fetchHrExpenseData();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Avans ve masraf verisi su anda alinamadi. Yetki ve backend erisimini kontrol edin.");
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
