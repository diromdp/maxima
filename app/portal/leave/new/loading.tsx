import { Skeleton } from "@mantine/core"

import { LeaveFormSkeleton } from "../LeaveForm"

export default function Loading() {
  return (
    <div className="stack stack-lg">
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={14} width="20%" radius="xl" />
        <Skeleton height={32} width="30%" radius="xl" />
        <Skeleton height={16} width="60%" radius="xl" />
      </div>
      <div className="grid-main-aside">
        <LeaveFormSkeleton />
        <Skeleton height={320} radius="md" aria-hidden />
      </div>
    </div>
  )
}
