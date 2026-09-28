import { Skeleton } from "@mantine/core"

import { TemplateGridSkeleton } from "./TemplateGrid"

export default function Loading() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="25%" radius="xl" />
        <Skeleton height={16} width="70%" radius="xl" />
      </div>

      <Skeleton height={72} radius="sm" aria-hidden />

      <TemplateGridSkeleton />
    </div>
  )
}
