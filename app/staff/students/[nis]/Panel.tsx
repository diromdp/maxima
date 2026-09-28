"use client"

import { Skeleton } from "@mantine/core"
import type { UseQueryResult } from "@tanstack/react-query"

import { QueryError } from "@/src/components/data/QueryError"
import type { ApiError } from "@/src/lib/api/errors"

export function Panel({
  title,
  aside,
  className,
  children,
}: {
  title: string
  aside?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={`card stack${className ? ` ${className}` : ""}`}>
      <div className="row row-between row-wrap">
        <h2 className="h6">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function FieldValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="stack" style={{ gap: 2, minWidth: 0 }}>
      <span className="caption text-muted">{label}</span>
      <span className="body-sm" style={{ fontWeight: 600, overflowWrap: "anywhere" }}>
        {value}
      </span>
    </div>
  )
}

export function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="body-sm text-muted">{children}</p>
}

const SKELETON_PANELS = 4

export function TabSkeleton() {
  return (
    <div className="grid-2" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      {Array.from({ length: SKELETON_PANELS }, (_, index) => (
        <Skeleton key={index} height={220} radius="md" aria-hidden />
      ))}
    </div>
  )
}

export function TabBody<T>({
  query,
  children,
}: {
  query: UseQueryResult<T, ApiError>
  children: (data: T) => React.ReactNode
}) {
  if (query.isError) {
    return <QueryError message={query.error.message} onRetry={() => void query.refetch()} />
  }
  if (query.isPending) return <TabSkeleton />
  return children(query.data)
}
