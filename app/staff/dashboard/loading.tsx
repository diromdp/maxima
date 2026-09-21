import { Skeleton } from "@mantine/core"

import { PIPELINE, QUEUE, STATUSES } from "./sample"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="30%" radius="xl" />
        <Skeleton height={16} width="60%" radius="xl" />
      </div>

      <section className="chart-card stack" aria-hidden>
        <Skeleton height={24} width="30%" radius="xl" />
        <div className="chart-kpis">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={88} radius="sm" />
          ))}
        </div>
        <Skeleton height={360} radius="sm" />
      </section>

      <section className="card stack" aria-hidden>
        <Skeleton height={24} width="40%" radius="xl" />
        <div className="stack stack-sm">
          {QUEUE.map((q) => (
            <Skeleton key={q.page} height={56} radius="sm" />
          ))}
        </div>
      </section>

      <section className="card stack" aria-hidden>
        <Skeleton height={24} width="40%" radius="xl" />
        <div className="journey" style={{ gap: 12 }}>
          {PIPELINE.map((s) => (
            <Skeleton key={s.id} height={108} radius="sm" />
          ))}
        </div>
      </section>

      <div className="grid-4" aria-hidden>
        {STATUSES.map((s) => (
          <Skeleton key={s.id} height={112} radius="md" />
        ))}
      </div>
    </div>
  )
}
