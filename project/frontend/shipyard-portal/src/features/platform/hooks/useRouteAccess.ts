import { useEffect, useMemo, useState } from "react";
import type { AppRoute } from "../../../app/routes";
import { fetchPlatformContext } from "../services/platformService";
import type { PlatformContextResponse } from "../types";

function isRouteEnabled(route: AppRoute, context: PlatformContextResponse | null) {
  if (!route.access || !context) {
    return true;
  }

  const domain = context.domains.find((row) => row.domain.key === route.access?.domainKey);
  if (!domain || !domain.domain.is_enabled) {
    return false;
  }

  const capabilityKey = route.access.capabilityKey;
  if (!capabilityKey) {
    return true;
  }

  return Boolean(domain.capabilities?.[capabilityKey]?.enabled);
}

export function useRouteAccess(routes: AppRoute[]) {
  const [platformContext, setPlatformContext] = useState<PlatformContextResponse | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchPlatformContext()
      .then((data) => {
        if (isMounted) {
          setPlatformContext(data);
          setIsLoaded(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPlatformContext(null);
          setIsLoaded(true);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleRoutes = useMemo(
    () => routes.filter((route) => isRouteEnabled(route, platformContext)),
    [routes, platformContext]
  );

  return {
    isLoaded,
    visibleRoutes,
    isRouteEnabled: (route: AppRoute) => isRouteEnabled(route, platformContext)
  };
}

