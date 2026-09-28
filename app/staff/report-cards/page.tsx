import { PageHeader } from "@/src/components/layout/PageHeader"
import { academicPeriodsQuery } from "@/src/entities/class/queries"
import { masterItemsQuery } from "@/src/entities/master-data/queries"
import { decisionsQuery, reportQueueQuery } from "@/src/entities/report-card/queries"
import { DECISION_FILTERS, REPORT_CARD_FILTERS } from "@/src/entities/report-card/schema"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { ReportCardTabs } from "./ReportCardTabs"

export default async function ReportCardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requirePermission("report-cards")
  const source = searchParamsSource(await searchParams)
  const isDecisions = source.get("tab") === "decisions"
  const read = isDecisions
    ? decisionsQuery(listParamsOf(source, DECISION_FILTERS))
    : reportQueueQuery(listParamsOf(source, REPORT_CARD_FILTERS))

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Raport"
        subtitle="Penerbitan raport dan kenaikan level. Nilai, sikap, dan absensi ditarik dari Penilaian dan Sesi Kelas."
      />

      <Prefetched reads={[read, academicPeriodsQuery(), masterItemsQuery()]}>
        <ReportCardTabs canEdit={canEdit(session.permissions, "report-cards")} />
      </Prefetched>
    </div>
  )
}
