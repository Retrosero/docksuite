import { useCallback, useEffect, useState } from "react";
import { fetchHrBenefitsData } from "../services/hrBenefitsService";
import type { HrBenefitsData } from "../types";

type UseHrBenefitsDataResult = {
  data: HrBenefitsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useHrBenefitsData(): UseHrBenefitsDataResult {
  const [data, setData] = useState<HrBenefitsData | null>(null);
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
        const response = await fetchHrBenefitsData();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Yan haklar verisi su anda alinamadi. Yetki ve backend erisimini kontrol edin.");
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
