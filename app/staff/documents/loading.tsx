import { Skeleton } from "@mantine/core"

import { STUDENTS } from "./sample"

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
            <Skeleton height={36} width={180} radius="xl" />
            <Skeleton height={36} width={160} radius="xl" />
            <Skeleton height={36} width={170} radius="xl" />
          </div>
        </div>
      </section>

      <section className="card stack" aria-hidden>
        <Skeleton height={20} width="30%" radius="xl" />
        <div className="stack stack-sm">
          {STUDENTS.map((student) => (
            <Skeleton key={student.nis} height={52} radius="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}
