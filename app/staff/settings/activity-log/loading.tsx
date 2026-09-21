import { Skeleton } from "@mantine/core"

const PAGE_SIZE = 10

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

      <section className="card stack" aria-hidden>
        <Skeleton height={24} width="30%" radius="xl" />
        <div className="grid-3">
          <Skeleton height={40} radius="xl" />
          <Skeleton height={40} radius="xl" />
          <Skeleton height={40} radius="xl" />
        </div>
        <div className="stack stack-sm">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <Skeleton key={i} height={48} radius="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}
