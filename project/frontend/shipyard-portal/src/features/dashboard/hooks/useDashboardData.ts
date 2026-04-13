import { useCallback, useEffect, useState } from "react";
import type { DashboardData } from "../types";
import { fetchDashboardData } from "../services/dashboardService";

type UseDashboardDataResult = {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => {
    setReloadToken((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchDashboardData();

        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Dashboard verisi alinamadi. Lutfen tekrar deneyin.");
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
  }, [reloadToken]);

  return {
    data,
    loading,
    error,
    refresh
  };
}
