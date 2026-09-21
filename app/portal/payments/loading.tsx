import { Skeleton } from "@mantine/core"

import { TRANSACTIONS } from "./payments"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="30%" radius="xl" />
        <Skeleton height={16} width="55%" radius="xl" />
      </div>

      <div className="grid-4" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <section key={i} className="card stack stack-sm">
            <Skeleton height={14} width="60%" radius="xl" />
            <Skeleton height={26} width="80%" radius="xl" />
          </section>
        ))}
      </div>

      <div className="grid-main-aside" aria-hidden>
        <div className="stack stack-lg">
          <section className="card stack stack-sm">
            <Skeleton height={24} width="35%" radius="xl" />
            <Skeleton height={56} radius="md" />
            <Skeleton height={56} radius="md" />
            <Skeleton height={56} radius="md" />
            <div className="grid-3">
              <Skeleton height={72} radius="md" />
              <Skeleton height={72} radius="md" />
              <Skeleton height={72} radius="md" />
            </div>
          </section>

          <section className="card stack stack-sm">
            <Skeleton height={24} width="40%" radius="xl" />
            <Skeleton height={36} radius="sm" />
            {TRANSACTIONS.map((t) => (
              <Skeleton key={t.id} height={44} radius="sm" />
            ))}
          </section>
        </div>

        <div className="stack stack-lg">
          <section className="card stack stack-sm">
            <Skeleton height={24} width="60%" radius="xl" />
            <Skeleton height={40} radius="sm" />
            <Skeleton height={20} radius="xl" />
            <Skeleton height={20} radius="xl" />
            <Skeleton height={20} radius="xl" />
          </section>

          <section className="card stack stack-sm">
            <Skeleton height={24} width="40%" radius="xl" />
            <Skeleton height={40} radius="sm" />
          </section>
        </div>
      </div>
    </div>
  )
}
