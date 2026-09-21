import { Skeleton } from "@mantine/core"

import { SERVICE_COLUMNS } from "../sample"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="36%" radius="xl" />
        <Skeleton height={16} width="56%" radius="xl" />
      </div>

      <section className="card" aria-hidden>
        <Skeleton height={20} width="60%" radius="xl" />
      </section>

      <section className="card stack" aria-hidden>
        <div className="stack stack-sm">
          {SERVICE_COLUMNS.map((column) => (
            <Skeleton key={column.id} height={52} radius="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}
