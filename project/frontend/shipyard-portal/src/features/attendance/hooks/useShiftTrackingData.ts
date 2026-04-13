import { useCallback, useEffect, useState } from "react";
import type { ShiftFilterState, ShiftTrackingData, ShiftTrackingViewMode } from "../types";
import { fetchShiftTrackingData } from "../services/shiftTrackingService";

type UseShiftTrackingDataArgs = {
  viewMode: ShiftTrackingViewMode;
  filters: ShiftFilterState;
};

type UseShiftTrackingDataResult = {
  data: ShiftTrackingData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useShiftTrackingData({ viewMode, filters }: UseShiftTrackingDataArgs): UseShiftTrackingDataResult {
  const [data, setData] = useState<ShiftTrackingData | null>(null);
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
        const response = await fetchShiftTrackingData(viewMode, filters);

        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Vardiya verisi su anda alinamadi. Lutfen tekrar deneyin.");
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
