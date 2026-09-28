import { serviceDetailQuery, serviceOptionsQuery } from "@/src/entities/service/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit, canView } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { ServiceDetail } from "../ServiceDetail"

export default async function ServiceDetailPage({ params }: { params: Promise<{ nis: string }> }) {
  const session = await requirePermission("services")
  const { nis } = await params
  const canWork = canEdit(session.permissions, "services")
  const canOpenReports = canView(session.permissions, "report-cards")

  return (
    <Prefetched
      reads={canWork ? [serviceDetailQuery(nis), serviceOptionsQuery()] : [serviceDetailQuery(nis)]}
    >
      <ServiceDetail nis={nis} canWork={canWork} canOpenReports={canOpenReports} />
    </Prefetched>
  )
}
