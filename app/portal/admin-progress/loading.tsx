import { Group, Skeleton, Stack, VisuallyHidden } from "@mantine/core"

import { JOURNEY, SERVICES } from "./data"

export default function Loading() {
  return (
    <Stack gap="lg" aria-busy="true">
      <VisuallyHidden role="status" aria-live="polite">
        Memuat
      </VisuallyHidden>

      <Stack gap="xs" mb="lg" aria-hidden>
        <Skeleton height={32} width="40%" radius="xl" />
        <Skeleton height={16} width="60%" radius="xl" />
      </Stack>

      <div className="card" aria-hidden>
        <Skeleton height={20} width="30%" radius="xl" mb="lg" />
        <Group justify="space-between" wrap="nowrap">
          {JOURNEY.map((node) => (
            <Skeleton key={node.label} height={32} circle />
          ))}
        </Group>
      </div>

      <div className="card" aria-hidden>
        <Skeleton height={20} width="30%" radius="xl" mb="md" />
        <Stack gap="sm">
          {SERVICES.map((row) => (
            <Skeleton key={row.service} height={20} radius="xl" />
          ))}
        </Stack>
      </div>

      <div className="grid-2" aria-hidden>
        <Skeleton height={320} radius="md" />
        <Skeleton height={320} radius="md" />
      </div>
    </Stack>
  )
}
