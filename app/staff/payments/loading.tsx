import { Skeleton } from "@mantine/core"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="25%" radius="xl" />
        <Skeleton height={16} width="45%" radius="xl" />
      </div>

      <div className="row" style={{ gap: 16 }} aria-hidden>
        <Skeleton height={36} width={100} radius="xl" />
        <Skeleton height={36} width={80} radius="xl" />
      </div>

      <section className="card stack" aria-hidden>
        <div className="stack stack-sm">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} height={44} radius="sm" />
          ))}
        </div>
        <Skeleton height={56} radius="sm" />
      </section>
    </div>
  )
}
