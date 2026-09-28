import { documentDetailQuery } from "@/src/entities/document/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { StudentDocuments } from "./StudentDocuments"

export default async function StudentDocumentsPage({
  params,
}: {
  params: Promise<{ nis: string }>
}) {
  const session = await requirePermission("documents")
  const { nis } = await params

  return (
    <Prefetched reads={[documentDetailQuery(nis)]}>
      <StudentDocuments
        nis={nis}
        canDecide={canEdit(session.permissions, "documents")}
        canUploadResults={canEdit(session.permissions, "services")}
      />
    </Prefetched>
  )
}
