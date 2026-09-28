import { ownLeaveQuery } from "@/src/entities/leave/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requireSession } from "@/src/lib/auth/session"

import { OwnLeaveDetail } from "../OwnLeaveDetail"

export default async function LeaveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession("student")
  const { id } = await params

  return (
    <Prefetched reads={[ownLeaveQuery(id)]}>
      <OwnLeaveDetail id={id} status={session.status} />
    </Prefetched>
  )
}
