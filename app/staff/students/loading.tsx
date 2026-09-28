import { Skeleton } from "@mantine/core"

import { TableSkeleton } from "@/src/components/data/TableSkeleton"
import { STUDENT_FILTERS } from "@/src/entities/student/schema"

const STUDENT_COLUMNS = 8

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="20%" radius="xl" />
        <Skeleton height={16} width="40%" radius="xl" />
      </div>

      <section className="card stack">
        <Skeleton height={24} width={200} radius="xl" aria-hidden />
        <div className="row row-wrap" style={{ gap: 8 }} aria-hidden>
          <Skeleton height={36} width={300} radius="xl" />
          {STUDENT_FILTERS.map((filter) => (
            <Skeleton key={filter} height={36} width={160} radius="xl" />
          ))}
        </div>
        <TableSkeleton columns={STUDENT_COLUMNS} />
      </section>
    </div>
  )
}
