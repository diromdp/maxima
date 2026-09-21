import { Skeleton } from "@mantine/core"

import { BOARD } from "./sample"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="28%" radius="xl" />
        <Skeleton height={16} width="46%" radius="xl" />
      </div>

      <div className="row" style={{ gap: 8 }} aria-hidden>
        <Skeleton height={36} width={200} radius="xl" />
        <Skeleton height={36} width={140} radius="xl" />
      </div>

      <section className="card" aria-hidden>
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <Skeleton height={36} width={260} radius="xl" />
          <div className="row row-wrap" style={{ gap: 8 }}>
            <Skeleton height={36} width={180} radius="xl" />
            <Skeleton height={36} width={200} radius="xl" />
          </div>
        </div>
      </section>

      <section className="card stack" aria-hidden>
        <Skeleton height={20} width="42%" radius="xl" />
        <div className="stack stack-sm">
          {BOARD.map((student) => (
            <Skeleton key={student.nis} height={52} radius="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}
