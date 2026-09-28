import { ownLeaveQuery } from "@/src/entities/leave/queries"
import { portalPaymentsQuery } from "@/src/entities/portal/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requireSession } from "@/src/lib/auth/session"

import { PaymentsView } from "./PaymentsView"

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ leave?: string | string[] }>
}) {
  const session = await requireSession("student")
  const { leave } = await searchParams
  const leaveId = typeof leave === "string" && leave !== "" ? leave : null

  return (
    <Prefetched reads={[portalPaymentsQuery(), ...(leaveId ? [ownLeaveQuery(leaveId)] : [])]}>
      <PaymentsView isOnLeave={session.status === "Cuti"} leaveId={leaveId} />
    </Prefetched>
  )
}
