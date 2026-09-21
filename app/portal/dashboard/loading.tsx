import { Skeleton } from "@mantine/core"

import { DOCUMENT_GROUPS } from "../documents/documents"
import { SERVICES } from "../payments/payments"
import { LEVELS } from "./dashboard"

const HISTORY_LIMIT = 4

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="40%" radius="xl" />
        <Skeleton height={16} width="70%" radius="xl" />
      </div>

      <Skeleton height={96} radius="sm" aria-hidden />

      <div className="grid-4" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={104} radius="md" />
        ))}
      </div>

      <div className="grid-main-aside" aria-hidden>
        <div className="stack stack-lg">
          <section className="card stack stack-sm">
            <Skeleton height={24} width="50%" radius="xl" />
            <div className="grid-4">
              {LEVELS.map((l) => (
                <Skeleton key={l.level} height={72} radius="md" />
              ))}
            </div>
            <Skeleton height={16} width="80%" radius="xl" />
          </section>

          <section className="card stack stack-sm">
            <Skeleton height={24} width="50%" radius="xl" />
            <Skeleton height={36} radius="sm" />
            {Array.from({ length: HISTORY_LIMIT }, (_, i) => (
              <Skeleton key={i} height={44} radius="sm" />
            ))}
          </section>
        </div>

        <div className="stack stack-lg">
          <section className="card stack stack-sm">
            <Skeleton height={24} width="50%" radius="xl" />
            <Skeleton height={16} width="70%" radius="xl" />
            {SERVICES.map((s) => (
              <Skeleton key={s.name} height={28} radius="sm" />
            ))}
          </section>

          <section className="card stack stack-sm">
            <Skeleton height={24} width="50%" radius="xl" />
            {DOCUMENT_GROUPS.map((d) => (
              <Skeleton key={d.id} height={28} radius="sm" />
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}
