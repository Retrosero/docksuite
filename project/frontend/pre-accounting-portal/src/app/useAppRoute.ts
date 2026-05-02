import { useEffect, useMemo, useState } from 'react'
import { findRoute } from './routes'

function getPathname(): string {
  return window.location.pathname || '/'
}

export function useAppRoute() {
  const [pathname, setPathname] = useState<string>(getPathname)

  useEffect(() => {
    const onPopState = () => setPathname(getPathname())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const activeRoute = useMemo(() => findRoute(pathname), [pathname])

  const navigate = (path: string) => {
    if (path === pathname) return
    window.history.pushState({}, '', path)
    setPathname(path)
  }

  return { pathname, activeRoute, navigate }
}
