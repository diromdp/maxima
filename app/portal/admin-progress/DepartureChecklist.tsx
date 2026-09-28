"use client"

import { Checkbox, Group, Skeleton, Text, Title } from "@mantine/core"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { QueryError } from "@/src/components/data/QueryError"
import { saveDepartureChecklist } from "@/src/entities/portal/actions"
import { departureChecklistQuery } from "@/src/entities/portal/queries"
import { useRead } from "@/src/lib/api/use-read"
import { notify } from "@/src/lib/notify"

const SKELETON_ITEMS = 15

export function DepartureChecklist({
  title = "Checklist Keberangkatan",
  isOnLeave = false,
}: {
  title?: string
  isOnLeave?: boolean
}) {
  const read = departureChecklistQuery()
  const checklist = useRead(read)
  const queryClient = useQueryClient()
  const save = useMutation({
    mutationFn: saveDepartureChecklist,
    onSuccess: (result) => {
      if (result.ok) queryClient.setQueryData(read.queryKey, result.data)
      else notify.error(result.message)
    },
  })

  return (
    <section className="card" aria-labelledby="checklist-heading">
      <Group justify="space-between" align="baseline" wrap="nowrap" mb="md">
        <div className="stack" style={{ gap: 2 }}>
          <Title order={5} id="checklist-heading">
            {title}
          </Title>
          <Text size="sm" c="dimmed">
            {isOnLeave
              ? "Centang dibuka lagi setelah masa cuti Anda selesai."
              : "Centang yang sudah Anda siapkan."}
          </Text>
        </div>
        {checklist.isSuccess && (
          <Text size="sm" c="dimmed" className="tabular" style={{ whiteSpace: "nowrap" }}>
            {checklist.data.checked} dari {checklist.data.total}
          </Text>
        )}
      </Group>

      {checklist.isError ? (
        <QueryError message={checklist.error.message} onRetry={() => void checklist.refetch()} />
      ) : checklist.isPending ? (
        <div className="grid-2" style={{ rowGap: 12 }} aria-busy="true">
          <span className="sr-only" role="status">
            Memuat
          </span>
          {Array.from({ length: SKELETON_ITEMS }, (_, index) => (
            <Skeleton key={index} height={20} radius="xl" aria-hidden />
          ))}
        </div>
      ) : checklist.data.items.length === 0 ? (
        <Text size="sm" c="dimmed">
          Belum ada butir checklist keberangkatan.
        </Text>
      ) : (
        <Checkbox.Group
          value={checklist.data.items.filter((item) => item.isChecked).map((item) => item.code)}
          onChange={(codes) => save.mutate(codes)}
        >
          <div className="grid-2" style={{ rowGap: 12 }}>
            {checklist.data.items.map((item) => (
              <Checkbox
                key={item.code}
                value={item.code}
                label={item.name}
                disabled={isOnLeave || save.isPending}
              />
            ))}
          </div>
        </Checkbox.Group>
      )}
    </section>
  )
}
