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

      <Skeleton height={104} radius="md" aria-hidden />

      <div className="grid-2" aria-hidden>
        <Skeleton height={320} radius="md" />
        <Skeleton height={320} radius="md" />
      </div>
    </div>
  )
}
