import { Skeleton } from "@mantine/core"
import type { CSSProperties, ReactNode } from "react"

export function Busy({
  className,
  style,
  children,
}: {
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <div className={className} style={style} aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      {children}
    </div>
  )
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid-4" aria-hidden>
      {Array.from({ length: count }, (_, card) => (
        <Skeleton key={card} height={112} radius="md" />
      ))}
    </div>
  )
}

export function PanelSkeleton({
  rows,
  rowHeight,
  titleWidth = "40%",
}: {
  rows: number
  rowHeight: number
  titleWidth?: string
}) {
  return (
    <section className="card stack" aria-hidden>
      <Skeleton height={24} width={titleWidth} radius="xl" />
      {Array.from({ length: rows }, (_, row) => (
        <Skeleton key={row} height={rowHeight} radius="sm" />
      ))}
    </section>
  )
}
