import { Skeleton } from "@mantine/core"

import { DOCUMENT_GROUPS } from "./documents"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="35%" radius="xl" />
        <Skeleton height={16} width="75%" radius="xl" />
      </div>

      <div className="grid-4" aria-hidden>
        {DOCUMENT_GROUPS.map((r) => (
          <Skeleton key={r.id} height={128} radius="md" />
        ))}
      </div>

      {DOCUMENT_GROUPS.map((r) => (
        <section key={r.id} className="card stack stack-sm" aria-hidden>
          <Skeleton height={24} width="25%" radius="xl" />
          <Skeleton height={36} radius="sm" />
          {r.files.map((b) => (
            <Skeleton key={b.name} height={44} radius="sm" />
          ))}
        </section>
      ))}
    </div>
  )
}
