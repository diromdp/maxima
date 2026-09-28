import { Skeleton } from "@mantine/core"

import { CertificateRowsSkeleton } from "./CertificateTable"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="40%" radius="xl" />
        <Skeleton height={16} width="70%" radius="xl" />
      </div>
      <section className="card">
        <CertificateRowsSkeleton />
      </section>
    </div>
  )
}
