import { Skeleton } from "@mantine/core"

import { CERTIFICATES } from "./sample"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="24%" radius="xl" />
        <Skeleton height={16} width="36%" radius="xl" />
      </div>

      <div className="row" style={{ gap: 16 }} aria-hidden>
        <Skeleton height={36} width={100} radius="xl" />
        <Skeleton height={36} width={150} radius="xl" />
        <Skeleton height={36} width={170} radius="xl" />
      </div>

      <section className="card stack" aria-hidden>
        <Skeleton height={56} radius="sm" />
        <div className="row row-wrap" style={{ gap: 8 }}>
          <Skeleton height={36} width={160} radius="xl" />
          <Skeleton height={36} width={160} radius="xl" />
          <Skeleton height={36} width={160} radius="xl" />
        </div>
        <div className="stack stack-sm">
          {CERTIFICATES.map((certificate) => (
            <Skeleton key={certificate.id} height={60} radius="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}
