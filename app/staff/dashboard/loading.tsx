import { Skeleton } from "@mantine/core"

import { HomeSectionsSkeleton } from "./HomeSections"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="30%" radius="xl" />
        <Skeleton height={16} width="60%" radius="xl" />
      </div>
      <HomeSectionsSkeleton />
    </div>
  )
}
