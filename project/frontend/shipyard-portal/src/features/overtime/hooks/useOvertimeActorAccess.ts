import { useCallback, useEffect, useState } from "react";
import type { OvertimeActorAccess } from "../types";
import { fetchOvertimeActorAccess } from "../services/overtimeService";

type UseOvertimeActorAccessResult = {
  access: OvertimeActorAccess;
  loading: boolean;
};

export function useOvertimeActorAccess(): UseOvertimeActorAccessResult {
  const [access, setAccess] = useState<OvertimeActorAccess>({
    user: null,
    roles: [],
    canViewManager: false,
    canApprove: false,
    defaultViewMode: "employee"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchOvertimeActorAccess();
        if (!cancelled) {
          setAccess(result);
        }
      } catch {
        if (!cancelled) {
          setAccess({
            user: null,
            roles: [],
            canViewManager: false,
            canApprove: false,
            defaultViewMode: "employee"
          });
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

  return { access, loading };
}
