import { Skeleton } from "@mantine/core"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack" aria-hidden>
        <Skeleton height={16} width="20%" radius="xl" />
        <Skeleton height={112} radius="md" />
      </div>

      <div className="stack" aria-hidden>
        <Skeleton height={40} width="60%" radius="xl" />
        <div className="grid-2">
          <Skeleton height={220} radius="md" />
          <Skeleton height={220} radius="md" />
          <Skeleton height={220} radius="md" />
          <Skeleton height={220} radius="md" />
        </div>
      </div>
    </div>
  )
}
