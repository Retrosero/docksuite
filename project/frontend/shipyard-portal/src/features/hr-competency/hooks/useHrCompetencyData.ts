import { useCallback, useEffect, useState } from "react";
import { fetchHrCompetencyData } from "../services/hrCompetencyService";
import type { HrCompetencyData } from "../types";

type UseHrCompetencyDataResult = {
  data: HrCompetencyData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useHrCompetencyData(): UseHrCompetencyDataResult {
  const [data, setData] = useState<HrCompetencyData | null>(null);
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
        const response = await fetchHrCompetencyData();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Yetkinlik matrisi verisi su anda alinamadi. Yetki ve backend erisimini kontrol edin.");
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
