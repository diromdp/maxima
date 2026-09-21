import { Skeleton, Stack, VisuallyHidden } from "@mantine/core"

export default function Loading() {
  return (
    <Stack gap="lg" aria-busy="true">
      <VisuallyHidden role="status" aria-live="polite">
        Memuat
      </VisuallyHidden>

      <Stack gap="xs" mb="lg" aria-hidden>
        <Skeleton height={32} width="35%" radius="xl" />
        <Skeleton height={16} width="60%" radius="xl" />
      </Stack>

      <Skeleton height={56} radius="sm" aria-hidden />
      <Skeleton height={200} radius="md" aria-hidden />
      <Skeleton height={320} radius="md" aria-hidden />
      <div className="grid-2" aria-hidden>
        <Skeleton height={420} radius="md" />
        <Skeleton height={420} radius="md" />
      </div>
    </Stack>
  )
}
