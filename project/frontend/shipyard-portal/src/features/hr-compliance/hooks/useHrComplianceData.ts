import { useCallback, useEffect, useState } from "react";
import { fetchHrComplianceData } from "../services/hrComplianceService";
import type { HrComplianceData } from "../types";

type UseHrComplianceDataResult = {
  data: HrComplianceData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useHrComplianceData(): UseHrComplianceDataResult {
  const [data, setData] = useState<HrComplianceData | null>(null);
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
        const response = await fetchHrComplianceData();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Uygunluk verisi su anda alinamadi. Yetki ve backend erisimini kontrol edin.");
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
