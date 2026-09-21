import { Skeleton } from "@mantine/core"

import { ROLES, USERS } from "./sample"

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

      <section className="card stack" aria-hidden>
        <Skeleton height={24} width="30%" radius="xl" />
        <div className="grid-3">
          <Skeleton height={40} radius="xl" />
          <Skeleton height={40} radius="xl" />
          <Skeleton height={40} radius="xl" />
        </div>
        <div className="stack stack-sm">
          {USERS.map((u) => (
            <Skeleton key={u.id} height={44} radius="sm" />
          ))}
        </div>
      </section>

      <section className="card stack" aria-hidden>
        <Skeleton height={24} width="20%" radius="xl" />
        <div className="stack stack-sm">
          {ROLES.map((r) => (
            <Skeleton key={r.name} height={44} radius="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}
