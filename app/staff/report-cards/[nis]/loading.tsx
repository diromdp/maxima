import { Skeleton } from "@mantine/core"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={16} width="30%" radius="xl" />
        <Skeleton height={32} width="25%" radius="xl" />
        <Skeleton height={16} width="40%" radius="xl" />
      </div>

      <Skeleton height={36} width={240} radius="xl" aria-hidden />

      <div className="grid-main-aside" aria-hidden>
        <Skeleton height={520} radius="md" />
        <div className="stack">
          <Skeleton height={200} radius="md" />
          <Skeleton height={200} radius="md" />
        </div>
      </div>
    </div>
  )
}
