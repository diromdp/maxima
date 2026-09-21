import { Skeleton } from "@mantine/core"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="35%" radius="xl" />
        <Skeleton height={16} width="70%" radius="xl" />
      </div>

      <div className="grid-4" aria-hidden>
        {[0, 1, 2, 3].map((card) => (
          <Skeleton key={card} height={112} radius="md" />
        ))}
      </div>

      <section className="card stack" aria-hidden>
        <Skeleton height={24} width="30%" radius="xl" />
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} height={88} radius="sm" />
        ))}
      </section>
    </div>
  )
}
