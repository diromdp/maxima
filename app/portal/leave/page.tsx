import { ownLeavesQuery } from "@/src/entities/leave/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requireSession } from "@/src/lib/auth/session"

import { LeaveHistory } from "./LeaveHistory"

export default async function LeaveHistoryPage() {
  const session = await requireSession("student")

  return (
    <Prefetched reads={[ownLeavesQuery()]}>
      <LeaveHistory status={session.status} />
    </Prefetched>
  )
}
