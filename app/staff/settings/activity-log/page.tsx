import { PageHeader } from "@/src/components/layout/PageHeader"
import {
  ACTIVITY_LOG_FILTERS,
  activityLogsQuery,
  logActorsQuery,
} from "@/src/entities/activity-log/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { LogTable } from "./LogTable"

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requirePermission("settings-activity-log")
  const params = listParamsOf(searchParamsSource(await searchParams), ACTIVITY_LOG_FILTERS)

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Log Aktivitas"
        subtitle="Rekaman aktivitas pengguna untuk keperluan audit dan penelusuran data. Perubahan Admission di wilayah Finance dan Akademik ditandai khusus."
      />

      <Prefetched reads={[activityLogsQuery(params), logActorsQuery()]}>
        <LogTable />
      </Prefetched>
    </div>
  )
}
