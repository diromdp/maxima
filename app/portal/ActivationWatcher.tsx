"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { portalPagesQuery } from "@/src/entities/portal/queries"
import { readApi } from "@/src/lib/api/read"

const POLL_MS = 15_000

// Menu portal terkunci sampai DP disahkan Finance di sisi staf. Selama terkunci, status
// halaman diperiksa berkala; begitu terbuka, layout dirender ulang tanpa reload.
export function ActivationWatcher() {
  const router = useRouter()
  const read = portalPagesQuery()
  const { data } = useQuery({
    queryKey: read.queryKey,
    queryFn: () => readApi(read),
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  })
  const isUnlocked = data?.pages.every((page) => page.lockReason === null) ?? false

  useEffect(() => {
    if (isUnlocked) router.refresh()
  }, [isUnlocked, router])

  return null
}
