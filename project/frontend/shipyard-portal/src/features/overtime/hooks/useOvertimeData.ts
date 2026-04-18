import { useCallback, useEffect, useState } from "react";
import type { OvertimeData, OvertimeFilterState } from "../types";
import { fetchOvertimeData } from "../services/overtimeService";

type UseOvertimeDataArgs = {
  viewMode: "employee" | "manager";
  filters: OvertimeFilterState;
};

type UseOvertimeDataResult = {
  data: OvertimeData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useOvertimeData({ viewMode, filters }: UseOvertimeDataArgs): UseOvertimeDataResult {
  const [data, setData] = useState<OvertimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchOvertimeData(viewMode, filters);

        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Mesai verisi su anda alinamadi. Lutfen tekrar deneyin.");
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
  }, [filters, refreshToken, viewMode]);

  return {
    data,
    loading,
    error,
    refresh
  };
}
