import { useCallback, useEffect, useState } from "react";
import { fetchHrReportsData } from "../services/hrReportsService";
import type { HrReportsData } from "../types";

type UseHrReportsDataResult = {
  data: HrReportsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useHrReportsData(): UseHrReportsDataResult {
  const [data, setData] = useState<HrReportsData | null>(null);
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
        const response = await fetchHrReportsData();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("IK raporlari verisi su anda alinamadi. Yetki ve backend erisimini kontrol edin.");
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
