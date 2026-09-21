import { Skeleton } from "@mantine/core"

import { TEMPLATES } from "./sample"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="25%" radius="xl" />
        <Skeleton height={16} width="70%" radius="xl" />
      </div>

      <Skeleton height={72} radius="sm" aria-hidden />

      <div className="grid-3" aria-hidden>
        {TEMPLATES.map((t) => (
          <Skeleton key={t.id} height={320} radius="md" />
        ))}
      </div>
    </div>
  )
}
