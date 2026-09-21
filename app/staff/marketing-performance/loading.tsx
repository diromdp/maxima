import { Skeleton } from "@mantine/core"

import { CONSULTANTS, DEMOGRAPHY, LEAD_SOURCES } from "./sample"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="28%" radius="xl" />
        <Skeleton height={16} width="50%" radius="xl" />
      </div>

      <Skeleton height={80} radius="md" aria-hidden />

      <div className="grid-4" aria-hidden>
        {[0, 1, 2, 3].map((card) => (
          <Skeleton key={card} height={112} radius="md" />
        ))}
      </div>

      <section className="card stack" aria-hidden>
        <Skeleton height={24} width="30%" radius="xl" />
        {CONSULTANTS.map((c) => (
          <Skeleton key={c.name} height={52} radius="sm" />
        ))}
      </section>

      <div className="grid-2" aria-hidden>
        <section className="card stack">
          <Skeleton height={24} width="50%" radius="xl" />
          {LEAD_SOURCES.map((s) => (
            <Skeleton key={s.name} height={36} radius="sm" />
          ))}
        </section>
        <section className="card stack">
          <Skeleton height={24} width="60%" radius="xl" />
          {DEMOGRAPHY.map((g) => (
            <Skeleton key={g.id} height={64} radius="sm" />
          ))}
        </section>
      </div>
    </div>
  )
}
