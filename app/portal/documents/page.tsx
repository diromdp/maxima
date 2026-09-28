import { ownDocumentsQuery } from "@/src/entities/document/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requireSession } from "@/src/lib/auth/session"

import { DocumentsView } from "./DocumentsView"

export default async function DocumentsPage() {
  const session = await requireSession("student")

  return (
    <Prefetched reads={[ownDocumentsQuery()]}>
      <DocumentsView isOnLeave={session.status === "Cuti"} />
    </Prefetched>
  )
}
