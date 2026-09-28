import { Skeleton } from "@mantine/core"

const SKELETON_ROWS = 8

export function SheetSkeleton() {
  return (
    <section className="card stack" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <div className="stack stack-sm" aria-hidden>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <Skeleton key={index} height={44} radius="sm" />
        ))}
      </div>
      <Skeleton height={56} radius="sm" aria-hidden />
    </section>
  )
}
