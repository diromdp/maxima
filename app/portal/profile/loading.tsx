import { Skeleton } from "@mantine/core"

import { ProfileSkeleton } from "./ProfileSkeleton"

export default function Loading() {
  return (
    <div className="stack stack-lg">
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="25%" radius="xl" />
        <Skeleton height={16} width="60%" radius="xl" />
      </div>
      <ProfileSkeleton />
    </div>
  )
}
