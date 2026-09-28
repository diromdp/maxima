import { Skeleton, Stack } from "@mantine/core"

import { AlumniFilesSkeleton } from "./AlumniFilesView"

export default function Loading() {
  return (
    <Stack gap="lg">
      <Stack gap="xs" mb="lg" aria-hidden>
        <Skeleton height={32} width="35%" radius="xl" />
        <Skeleton height={16} width="60%" radius="xl" />
      </Stack>

      <AlumniFilesSkeleton />
    </Stack>
  )
}
