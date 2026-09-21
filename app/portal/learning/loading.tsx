import { Skeleton, Stack, VisuallyHidden } from "@mantine/core"

import { LEVELS, REPORTS, RUNNING_LEVEL } from "./data"

export default function Loading() {
  return (
    <Stack gap="lg" aria-busy="true">
      <VisuallyHidden role="status" aria-live="polite">
        Memuat
      </VisuallyHidden>

      <Stack gap="xs" mb="lg" aria-hidden>
        <Skeleton height={32} width="35%" radius="xl" />
        <Skeleton height={16} width="65%" radius="xl" />
      </Stack>

      <div className="level-grid" aria-hidden>
        {LEVELS.map(({ level }) => (
          <Skeleton key={level} height={96} radius="sm" />
        ))}
      </div>

      <Skeleton height={120} radius="md" aria-hidden />

      {/* Rapor: bentuknya mengikuti jumlah bab level berjalan. */}
      <div className="card" aria-hidden>
        <Skeleton height={20} width="35%" radius="xl" mb="lg" />
        <Stack gap="sm">
          {(REPORTS[RUNNING_LEVEL]?.chapters ?? []).map((row) => (
            <Skeleton key={row.chapter} height={20} radius="xl" />
          ))}
        </Stack>
        <Skeleton height={220} radius="md" mt="lg" />
      </div>
    </Stack>
  )
}
