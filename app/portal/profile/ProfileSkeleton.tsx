import { Skeleton } from "@mantine/core"

export function ProfileSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <Skeleton height={104} radius="md" aria-hidden />
      <div className="grid-2" aria-hidden>
        <Skeleton height={320} radius="md" />
        <Skeleton height={320} radius="md" />
      </div>
    </div>
  )
}
