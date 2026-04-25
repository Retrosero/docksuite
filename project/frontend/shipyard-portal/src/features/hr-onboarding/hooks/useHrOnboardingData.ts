import { useCallback, useEffect, useState } from "react";
import { fetchHrOnboardingData } from "../services/hrOnboardingService";
import type { HrOnboardingData } from "../types";

type UseHrOnboardingDataResult = {
  data: HrOnboardingData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useHrOnboardingData(): UseHrOnboardingDataResult {
  const [data, setData] = useState<HrOnboardingData | null>(null);
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
        const response = await fetchHrOnboardingData();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Ise giris sureci verisi su anda alinamadi. Yetki ve backend erisimini kontrol edin.");
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
