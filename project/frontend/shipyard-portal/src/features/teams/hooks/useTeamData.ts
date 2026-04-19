import { useCallback, useEffect, useState } from "react";
import type { TeamData, TeamFilterState } from "../types";
import { fetchTeamData } from "../services/teamService";

type UseTeamDataResult = {
  data: TeamData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useTeamData(filters: TeamFilterState): UseTeamDataResult {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchTeamData(filters);

        if (!cancelled) {
          setData(response);
        }
      } catch {
        if (!cancelled) {
          setError("Ekip verisi şu anda alınamadı. Lütfen tekrar deneyin.");
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
  }, [filters, refreshToken]);

  return {
    data,
    loading,
    error,
    refresh
  };
}
