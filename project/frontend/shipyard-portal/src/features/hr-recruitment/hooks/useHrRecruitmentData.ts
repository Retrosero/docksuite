import { useCallback, useEffect, useState } from "react";
import { fetchHrRecruitmentData } from "../services/hrRecruitmentService";
import type { HrRecruitmentData } from "../types";

type UseHrRecruitmentDataResult = {
  data: HrRecruitmentData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useHrRecruitmentData(): UseHrRecruitmentDataResult {
  const [data, setData] = useState<HrRecruitmentData | null>(null);
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
        const response = await fetchHrRecruitmentData();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Aday takip verisi su anda alinamadi. Yetki ve backend erisimini kontrol edin.");
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
