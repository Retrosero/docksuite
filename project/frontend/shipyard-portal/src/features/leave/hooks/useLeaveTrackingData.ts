import { useCallback, useEffect, useState } from "react";
import type { LeaveFilterState, LeaveTrackingData, LeaveTrackingViewMode } from "../types";
import { fetchLeaveTrackingData } from "../services/leaveTrackingService";

type UseLeaveTrackingDataArgs = {
  viewMode: LeaveTrackingViewMode;
  filters: LeaveFilterState;
};

type UseLeaveTrackingDataResult = {
  data: LeaveTrackingData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useLeaveTrackingData({ viewMode, filters }: UseLeaveTrackingDataArgs): UseLeaveTrackingDataResult {
  const [data, setData] = useState<LeaveTrackingData | null>(null);
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
        const response = await fetchLeaveTrackingData(viewMode, filters);

        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Izin verisi su anda alinamadi. Lutfen tekrar deneyin.");
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
