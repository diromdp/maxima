import { Skeleton } from "@mantine/core"

import { LeaveHistorySkeleton } from "./LeaveHistory"

export default function Loading() {
  return (
    <div className="stack stack-lg">
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="35%" radius="xl" />
        <Skeleton height={16} width="70%" radius="xl" />
      </div>
      <LeaveHistorySkeleton />
    </div>
  )
}
