import { useCallback, useEffect, useState } from "react";
import { fetchHrSelfServiceData } from "../services/hrSelfServiceService";
import type { HrSelfServiceData } from "../types";

type UseHrSelfServiceDataResult = {
  data: HrSelfServiceData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useHrSelfServiceData(): UseHrSelfServiceDataResult {
  const [data, setData] = useState<HrSelfServiceData | null>(null);
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
        const payload = await fetchHrSelfServiceData();
        if (!cancelled) {
          setData(payload);
        }
      } catch {
        if (!cancelled) {
          setError("Calisan paneli verisi alinamadi. Yetki ve backend erisimini kontrol edin.");
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
