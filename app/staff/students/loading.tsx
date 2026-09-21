import { Skeleton } from "@mantine/core"

import { FILTERS, STUDENTS } from "./sample"

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

      <section className="card stack" aria-hidden>
        <div className="row row-wrap" style={{ gap: 8 }}>
          <Skeleton height={36} width={300} radius="xl" />
          {FILTERS.map((f) => (
            <Skeleton key={f.key} height={36} width={f.label.length * 8 + 60} radius="xl" />
          ))}
        </div>
        <div className="stack stack-sm">
          {STUDENTS.map((s) => (
            <Skeleton key={s.nis} height={52} radius="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}
