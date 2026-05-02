import { useEffect, useState } from 'react'

type UseQueryBackedFilterOptions = {
  queryKey: string
  storageKey: string
  defaultValue: string
  allowedValues?: string[]
}

function readInitialValue(options: UseQueryBackedFilterOptions): string {
  const params = new URLSearchParams(window.location.search)
  const queryValue = params.get(options.queryKey)
  const storageValue = window.localStorage.getItem(options.storageKey)
  const candidate = queryValue ?? storageValue ?? options.defaultValue
  if (options.allowedValues && !options.allowedValues.includes(candidate)) {
    return options.defaultValue
  }
  return candidate
}

export function useQueryBackedFilter(options: UseQueryBackedFilterOptions) {
  const [value, setValue] = useState<string>(() => readInitialValue(options))

  useEffect(() => {
    window.localStorage.setItem(options.storageKey, value)
    const params = new URLSearchParams(window.location.search)
    if (value.trim() && value !== options.defaultValue) {
      params.set(options.queryKey, value.trim())
    } else {
      params.delete(options.queryKey)
    }
    const query = params.toString()
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname
    window.history.replaceState({}, '', nextUrl)
  }, [options.defaultValue, options.queryKey, options.storageKey, value])

  return [value, setValue] as const
}
