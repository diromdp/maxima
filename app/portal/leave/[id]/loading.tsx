import { Skeleton } from "@mantine/core"

import { OwnLeaveDetailSkeleton } from "../OwnLeaveDetail"

export default function Loading() {
  return (
    <div className="stack stack-lg">
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={14} width="20%" radius="xl" />
        <Skeleton height={32} width="35%" radius="xl" />
        <Skeleton height={16} width="55%" radius="xl" />
      </div>
      <OwnLeaveDetailSkeleton />
    </div>
  )
}
