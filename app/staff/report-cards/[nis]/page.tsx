import { reportCardQuery } from "@/src/entities/report-card/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"
import { searchParamsSource } from "@/src/lib/list-query"

import { ReportCardView } from "./ReportCardView"

import "./print.css"

export default async function ReportCardDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ nis: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requirePermission("report-cards")
  const nis = decodeURIComponent((await params).nis)
  const query = searchParamsSource(await searchParams)
  const level = query.get("level") ?? undefined
  const period = query.get("period") ?? undefined

  return (
    <Prefetched reads={[reportCardQuery(nis, { level, period })]}>
      <ReportCardView
        nis={nis}
        level={level}
        period={period}
        canEdit={canEdit(session.permissions, "report-cards")}
      />
    </Prefetched>
  )
}
