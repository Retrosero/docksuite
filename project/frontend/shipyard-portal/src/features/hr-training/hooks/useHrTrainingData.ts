import { useCallback, useEffect, useState } from "react";
import { fetchHrTrainingData } from "../services/hrTrainingService";
import type { HrTrainingData } from "../types";

type UseHrTrainingDataResult = {
  data: HrTrainingData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useHrTrainingData(): UseHrTrainingDataResult {
  const [data, setData] = useState<HrTrainingData | null>(null);
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
        const response = await fetchHrTrainingData();
        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Egitim ve sertifika verisi su anda alinamadi. Yetki ve backend erisimini kontrol edin.");
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
