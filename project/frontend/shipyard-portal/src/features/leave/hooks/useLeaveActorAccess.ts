import { useEffect, useState } from "react";
import type { LeaveActorAccess } from "../types";
import { fetchLeaveActorAccess } from "../services/leaveTrackingService";

type UseLeaveActorAccessResult = {
  access: LeaveActorAccess;
  loading: boolean;
};

const FALLBACK_ACCESS: LeaveActorAccess = {
  user: null,
  roles: [],
  canViewManager: false,
  defaultViewMode: "employee"
};

export function useLeaveActorAccess(): UseLeaveActorAccessResult {
  const [access, setAccess] = useState<LeaveActorAccess>(FALLBACK_ACCESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetchLeaveActorAccess();

        if (!cancelled) {
          setAccess(response);
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
