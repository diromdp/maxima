import { placementQuery } from "@/src/entities/placement/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { AlumniDetail } from "./AlumniDetail"

export default async function AlumniDetailPage({ params }: { params: Promise<{ nis: string }> }) {
  const session = await requirePermission("visa-placement")
  const { nis } = await params

  return (
    <Prefetched reads={[placementQuery(nis)]}>
      <AlumniDetail nis={nis} canEdit={canEdit(session.permissions, "visa-placement")} />
    </Prefetched>
  )
}
