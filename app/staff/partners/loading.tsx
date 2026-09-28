import { Skeleton } from "@mantine/core"

import { TableSkeleton } from "@/src/components/data/TableSkeleton"

const TAB_WIDTHS = [130, 110, 160, 100]
const FILTER_WIDTHS = [240, 150, 150, 150]
const COLUMN_COUNT = 8
const SKELETON_ROWS = 6

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="14%" radius="xl" />
        <Skeleton height={16} width="44%" radius="xl" />
      </div>

      <div className="row" style={{ gap: 16 }} aria-hidden>
        {TAB_WIDTHS.map((width) => (
          <Skeleton key={width} height={36} width={width} radius="xl" />
        ))}
      </div>

      <section className="card stack" aria-hidden>
        <div className="row row-wrap" style={{ gap: 8 }}>
          {FILTER_WIDTHS.map((width, index) => (
            <Skeleton key={index} height={36} width={width} radius="xl" />
          ))}
        </div>
        <TableSkeleton columns={COLUMN_COUNT} rows={SKELETON_ROWS} />
      </section>
    </div>
  )
}
