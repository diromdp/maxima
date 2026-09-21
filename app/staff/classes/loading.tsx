import { Skeleton } from "@mantine/core"

import { CLASSES } from "./sample"

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

      <div className="row" style={{ gap: 16 }} aria-hidden>
        <Skeleton height={36} width={110} radius="xl" />
        <Skeleton height={36} width={120} radius="xl" />
        <Skeleton height={36} width={150} radius="xl" />
      </div>

      <section className="card stack" aria-hidden>
        <div className="row row-wrap" style={{ gap: 8 }}>
          <Skeleton height={36} width={300} radius="xl" />
          <Skeleton height={36} width={150} radius="xl" />
          <Skeleton height={36} width={150} radius="xl" />
          <Skeleton height={36} width={150} radius="xl" />
        </div>
        <div className="stack stack-sm">
          {CLASSES.map((room) => (
            <Skeleton key={room.id} height={52} radius="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}
