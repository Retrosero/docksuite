import { useCallback, useEffect, useState } from "react";
import { fetchHrOffboardingData } from "../services/hrOffboardingService";
import type { HrOffboardingData } from "../types";

type UseHrOffboardingDataResult = {
  data: HrOffboardingData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useHrOffboardingData(): UseHrOffboardingDataResult {
  const [data, setData] = useState<HrOffboardingData | null>(null);
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
        const response = await fetchHrOffboardingData();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Isten cikis sureci verisi su anda alinamadi. Yetki ve backend erisimini kontrol edin.");
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
