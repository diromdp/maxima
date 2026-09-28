import { Skeleton } from "@mantine/core"

import { TableSkeleton } from "@/src/components/data/TableSkeleton"

const PAYMENT_COLUMNS = 8
const FILTER_WIDTHS = [320, 160, 160, 150, 150] as const

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="25%" radius="xl" />
        <Skeleton height={16} width="70%" radius="xl" />
      </div>

      <section className="card stack" aria-hidden>
        <div className="row row-between row-wrap">
          <div className="row row-wrap" style={{ gap: 8 }}>
            {FILTER_WIDTHS.map((width, index) => (
              <Skeleton key={index} height={36} width={width} radius="xl" />
            ))}
          </div>
          <Skeleton height={32} width={200} radius="xl" />
        </div>
        <TableSkeleton columns={PAYMENT_COLUMNS} />
      </section>
    </div>
  )
}
