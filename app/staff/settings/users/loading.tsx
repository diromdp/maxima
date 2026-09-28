import { Skeleton } from "@mantine/core"

import { TableSkeleton } from "@/src/components/data/TableSkeleton"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="30%" radius="xl" />
        <Skeleton height={16} width="60%" radius="xl" />
      </div>

      <section className="card stack" aria-hidden>
        <Skeleton height={24} width="30%" radius="xl" />
        <div className="row row-wrap" style={{ gap: 8 }}>
          <Skeleton height={36} width={320} radius="xl" />
          <Skeleton height={36} width={160} radius="xl" />
          <Skeleton height={36} width={160} radius="xl" />
        </div>
        <TableSkeleton columns={6} />
      </section>

      <section className="card stack" aria-hidden>
        <Skeleton height={24} width="20%" radius="xl" />
        <TableSkeleton columns={5} rows={7} />
      </section>
    </div>
  )
}
