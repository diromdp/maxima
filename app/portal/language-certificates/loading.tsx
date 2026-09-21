import { Skeleton } from "@mantine/core"

import { SERTIFIKAT } from "./certificates"

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

      <section className="card stack stack-sm" aria-hidden>
        <Skeleton height={36} radius="sm" />
        {SERTIFIKAT.map((s) => (
          <Skeleton key={s.id} height={44} radius="sm" />
        ))}
      </section>

      <section className="card stack stack-sm" aria-hidden>
        <Skeleton height={24} width="30%" radius="xl" />
        <div className="grid-2">
          <Skeleton height={56} radius="sm" />
          <Skeleton height={56} radius="sm" />
        </div>
        <div className="grid-4">
          <Skeleton height={56} radius="sm" />
          <Skeleton height={56} radius="sm" />
          <Skeleton height={56} radius="sm" />
          <Skeleton height={56} radius="sm" />
        </div>
        <Skeleton height={96} radius="md" />
      </section>
    </div>
  )
}
