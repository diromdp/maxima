import { Skeleton } from "@mantine/core"

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

      <div className="row row-wrap" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={36} width={120} radius="xl" />
        ))}
      </div>

      <section className="card stack" aria-hidden>
        <Skeleton height={20} width="30%" radius="xl" />
        <div className="stack stack-sm">
          {[0, 1, 2].map((j) => (
            <Skeleton key={j} height={36} radius="sm" />
          ))}
        </div>
      </section>
    </div>
  )
}
