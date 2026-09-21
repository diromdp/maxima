import { Skeleton } from "@mantine/core"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="25%" radius="xl" />
        <Skeleton height={16} width="60%" radius="xl" />
      </div>

      <section className="card" aria-hidden>
        <div className="grid-4">
          {[0, 1, 2, 3].map((figure) => (
            <div key={figure} className="stack stack-sm">
              <Skeleton height={14} width="70%" radius="xl" />
              <Skeleton height={28} width="40%" radius="xl" />
              <Skeleton height={12} width="85%" radius="xl" />
            </div>
          ))}
        </div>
      </section>

      {[0, 1].map((table) => (
        <section key={table} className="card stack" aria-hidden>
          <Skeleton height={24} width="30%" radius="xl" />
          <Skeleton height={32} width="45%" radius="xl" />
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} height={52} radius="sm" />
          ))}
        </section>
      ))}
    </div>
  )
}
