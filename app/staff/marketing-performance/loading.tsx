import { Skeleton } from "@mantine/core"

import { MarketingBoardSkeleton } from "./MarketingBoard"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="28%" radius="xl" />
        <Skeleton height={16} width="50%" radius="xl" />
      </div>

      <MarketingBoardSkeleton />
    </div>
  )
}
