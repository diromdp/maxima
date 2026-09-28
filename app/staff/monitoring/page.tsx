import { PageHeader } from "@/src/components/layout/PageHeader"
import {
  atRiskQuery,
  monitoringClassesQuery,
  monitoringTeachersQuery,
} from "@/src/entities/monitoring/queries"
import { AT_RISK_FILTERS, atRiskFiltersOf } from "@/src/entities/monitoring/schema"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { MonitoringTabs } from "./MonitoringTabs"

export default async function MonitoringPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requirePermission("monitoring")
  const source = searchParamsSource(await searchParams)
  const tab = source.get("tab")
  const reads =
    tab === "classes"
      ? [monitoringClassesQuery()]
      : tab === "at-risk"
        ? [
            atRiskQuery(atRiskFiltersOf(listParamsOf(source, AT_RISK_FILTERS))),
            monitoringClassesQuery(),
          ]
        : [monitoringTeachersQuery()]

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Monitoring Akademik"
        subtitle="Menemukan yang tertinggal: pengajar, kelas, dan siswa. Seluruhnya dihitung dari data kelas, sesi, dan penilaian."
      />

      <Prefetched reads={reads}>
        <MonitoringTabs />
      </Prefetched>
    </div>
  )
}
