import { portalDashboardQuery } from "@/src/entities/portal/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requireSession } from "@/src/lib/auth/session"

import { DashboardView } from "./DashboardView"

export default async function DashboardPage() {
  await requireSession("student")

  return (
    <Prefetched reads={[portalDashboardQuery()]}>
      <DashboardView />
    </Prefetched>
  )
}
