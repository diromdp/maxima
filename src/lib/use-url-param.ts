"use client"

import { useSearchParams } from "next/navigation"

export function useUrlParam(
  key: string,
  fallback: string,
  isValid: (value: string) => boolean = () => true,
) {
  const searchParams = useSearchParams()
  const raw = searchParams.get(key) ?? ""
  const value = raw !== "" && isValid(raw) ? raw : fallback

  function setValue(next: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (next) params.set(key, next)
    else params.delete(key)
    const text = params.toString()
    window.history.replaceState(null, "", text ? `?${text}` : window.location.pathname)
  }

  return [value, setValue] as const
}
