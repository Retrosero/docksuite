import { useEffect, useState } from "react";
import { normalizePathname } from "./routes";

export function useAppRoute() {
  const [pathname, setPathname] = useState(() => normalizePathname(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setPathname(normalizePathname(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return pathname;
}

export function navigateTo(pathname: string) {
  const nextPath = normalizePathname(pathname);

  if (nextPath === normalizePathname(window.location.pathname)) {
    return;
  }

  window.history.pushState({}, "", nextPath);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
