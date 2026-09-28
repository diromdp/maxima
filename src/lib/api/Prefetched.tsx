import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { api } from "./client"
import type { ReadQuery } from "./read"

export async function Prefetched({
  reads,
  children,
}: {
  reads: readonly ReadQuery<unknown>[]
  children: ReactNode
}) {
  const client = new QueryClient()
  await Promise.all(
    reads.map((read) =>
      client.prefetchQuery({
        queryKey: read.queryKey,
        queryFn: () => api(read.path, { query: read.query }),
      }),
    ),
  )
  return <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>
}
