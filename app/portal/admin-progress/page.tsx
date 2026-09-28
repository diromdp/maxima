import {
  departureChecklistQuery,
  ownPartnersQuery,
  portalProgressQuery,
} from "@/src/entities/portal/queries"
import { ownDocumentsQuery } from "@/src/entities/document/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requireSession } from "@/src/lib/auth/session"

import { ProgressView } from "./ProgressView"

export default async function AdminProgressPage() {
  const session = await requireSession("student")

  return (
    <Prefetched
      reads={[
        portalProgressQuery(),
        ownPartnersQuery(),
        ownDocumentsQuery(),
        departureChecklistQuery(),
      ]}
    >
      <ProgressView isOnLeave={session.status === "Cuti"} />
    </Prefetched>
  )
}
