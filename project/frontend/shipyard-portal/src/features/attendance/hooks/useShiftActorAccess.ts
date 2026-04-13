import { useEffect, useState } from "react";
import type { ShiftActorAccess } from "../types";
import { fetchShiftActorAccess } from "../services/shiftTrackingService";

const FALLBACK_ACTOR_ACCESS: ShiftActorAccess = {
  user: null,
  roles: [],
  canViewForeman: false,
  canViewWorker: true,
  defaultViewMode: "worker"
};

type UseShiftActorAccessResult = {
  access: ShiftActorAccess;
  loading: boolean;
};

export function useShiftActorAccess(): UseShiftActorAccessResult {
  const [access, setAccess] = useState<ShiftActorAccess>(FALLBACK_ACTOR_ACCESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const response = await fetchShiftActorAccess();

        if (!cancelled) {
          setAccess(response);
        }
      } catch {
        if (!cancelled) {
          setAccess(FALLBACK_ACTOR_ACCESS);
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
  }, []);

  return {
    access,
    loading
  };
}
