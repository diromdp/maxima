import { Skeleton } from "@mantine/core"

const SKELETON_ROWS = 10

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="20%" radius="xl" />
        <Skeleton height={16} width="40%" radius="xl" />
      </div>

      <Skeleton height={48} radius="sm" aria-hidden />

      <section className="card stack" aria-hidden>
        <div className="row row-wrap" style={{ gap: 12 }}>
          <Skeleton height={36} width={160} radius="xl" />
          <Skeleton height={36} width={120} radius="xl" />
          <Skeleton height={36} width={160} radius="xl" />
        </div>
        <div className="stack stack-sm">
          {Array.from({ length: SKELETON_ROWS }, (_, row) => (
            <Skeleton key={row} height={44} radius="sm" />
          ))}
        </div>
        <Skeleton height={56} radius="sm" />
      </section>
    </div>
  )
}
