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
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <div className="row row-wrap" style={{ gap: 12 }}>
            <Skeleton height={36} width={180} radius="xl" />
            <Skeleton height={36} width={240} radius="xl" />
          </div>
          <div className="row row-wrap" style={{ gap: 24 }}>
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} height={36} width={96} radius="sm" />
            ))}
          </div>
        </div>
      </section>

      <div className="grid-main-aside" style={{ alignItems: "start" }} aria-hidden>
        <section className="card stack">
          <Skeleton height={20} width="50%" radius="xl" />
          <div className="stack stack-sm">
            {ROWS.map((student) => (
              <Skeleton key={student.nis} height={44} radius="sm" />
            ))}
          </div>
        </section>
        <div className="stack">
          <section className="card stack">
            <Skeleton height={20} width="50%" radius="xl" />
            <Skeleton height={42} radius="sm" />
            <Skeleton height={42} radius="sm" />
            <Skeleton height={42} radius="sm" />
          </section>
          <section className="card stack">
            <Skeleton height={20} width="50%" radius="xl" />
            <Skeleton height={112} radius="sm" />
          </section>
        </div>
      </div>
    </div>
  )
}
