import { Skeleton } from "@mantine/core"

import { STUDENTS_BY_CLASS } from "./sample"

const ROWS = STUDENTS_BY_CLASS.berlin

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="20%" radius="xl" />
        <Skeleton height={16} width="30%" radius="xl" />
      </div>

      <section className="card" aria-hidden>
        <div className="row row-wrap" style={{ gap: 12 }}>
          <Skeleton height={36} width={220} radius="xl" />
          <Skeleton height={36} width={140} radius="xl" />
          <Skeleton height={36} width={160} radius="xl" />
        </div>
      </section>

      <div className="row" style={{ gap: 16 }} aria-hidden>
        <Skeleton height={36} width={110} radius="xl" />
        <Skeleton height={36} width={120} radius="xl" />
        <Skeleton height={36} width={140} radius="xl" />
        <Skeleton height={36} width={160} radius="xl" />
      </div>

      <section className="card stack" aria-hidden>
        <div className="stack stack-sm">
          {ROWS.map((student) => (
            <Skeleton key={student.nis} height={44} radius="sm" />
          ))}
        </div>
        <Skeleton height={56} radius="sm" />
      </section>
    </div>
  )
}
