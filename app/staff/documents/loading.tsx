import { Skeleton } from "@mantine/core"

import { TableSkeleton } from "@/src/components/data/TableSkeleton"

const INDEX_COLUMNS = 8
const FILTER_WIDTHS = [180, 160, 170] as const

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="16%" radius="xl" />
        <Skeleton height={16} width="40%" radius="xl" />
      </div>

      <section className="card" aria-hidden>
        <div className="row row-between row-wrap">
          <Skeleton height={36} width={260} radius="xl" />
          <div className="row row-wrap" style={{ gap: 8 }}>
            {FILTER_WIDTHS.map((width, index) => (
              <Skeleton key={index} height={36} width={width} radius="xl" />
            ))}
          </div>
        </div>
      </section>

      <section className="card stack" aria-hidden>
        <div className="row row-between row-wrap">
          <Skeleton height={20} width="30%" radius="xl" />
          <Skeleton height={24} width={200} radius="xl" />
        </div>
        <TableSkeleton columns={INDEX_COLUMNS} />
      </section>
    </div>
  )
}
