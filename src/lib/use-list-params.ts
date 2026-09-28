"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { listParamsOf, type ListParams } from "./list-query"

const KEEPS_PAGE: ReadonlySet<string> = new Set(["page"])

export function useListParams<Filter extends string = never>(filters: readonly Filter[] = []) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params: ListParams<Filter> = listParamsOf(searchParams, filters)

  function setParams(changes: Record<string, string | number | null | undefined>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === undefined || value === "") next.delete(key)
      else next.set(key, String(value))
    }
    if (Object.keys(changes).some((key) => !KEEPS_PAGE.has(key))) next.delete("page")
    const text = next.toString()
    router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false })
  }

  return { params, setParams }
}
