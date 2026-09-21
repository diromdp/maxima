import { Skeleton } from "@mantine/core"

import { ALUMNI } from "./sample"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="26%" radius="xl" />
        <Skeleton height={16} width="50%" radius="xl" />
      </div>

      <section className="card stack" aria-hidden>
        <div className="row row-between row-wrap">
          <Skeleton height={36} width={280} radius="xl" />
          <div className="row row-wrap" style={{ gap: 8 }}>
            <Skeleton height={36} width={160} radius="xl" />
            <Skeleton height={36} width={170} radius="xl" />
            <Skeleton height={36} width={170} radius="xl" />
          </div>
        </div>
        <div className="stack stack-sm">
          {ALUMNI.map((alumnus) => (
            <Skeleton key={alumnus.nis} height={56} radius="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}
