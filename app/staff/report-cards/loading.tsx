import { Skeleton } from "@mantine/core"

import { QUEUE } from "./sample"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="20%" radius="xl" />
        <Skeleton height={16} width="40%" radius="xl" />
      </div>

      <Skeleton height={48} radius="sm" aria-hidden />

      <section className="card stack" aria-hidden>
        <div className="row row-wrap" style={{ gap: 12 }}>
          <Skeleton height={36} width={160} radius="xl" />
          <Skeleton height={36} width={120} radius="xl" />
          <Skeleton height={36} width={160} radius="xl" />
        </div>
        <div className="stack stack-sm">
          {QUEUE.map((row) => (
            <Skeleton key={row.nis} height={44} radius="sm" />
          ))}
        </div>
        <Skeleton height={56} radius="sm" />
      </section>
    </div>
  )
}
