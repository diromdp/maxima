import { leaveQuery } from "@/src/entities/leave/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { hasCapability, requirePermission } from "@/src/lib/auth/session"

import { LeaveDetailView } from "../LeaveDetailView"

export default async function LeaveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission("leave")
  const { id } = await params
  const isEditor = canEdit(session.permissions, "leave")
  const can = (capability: string) => isEditor && hasCapability(session, capability)

  return (
    <Prefetched reads={[leaveQuery(id)]}>
      <LeaveDetailView
        id={id}
        abilities={{
          canAssess: can("leaves.finance-assessment"),
          canVerifyPayment: can("leaves.verify-payment"),
          canApprove: can("leaves.approve"),
          viewerId: session.id,
        }}
      />
    </Prefetched>
  )
}
