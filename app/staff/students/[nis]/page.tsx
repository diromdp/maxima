import { studentQuery } from "@/src/entities/student/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { StudentDetailView } from "./StudentDetailView"

export default async function StudentDetailPage({ params }: { params: Promise<{ nis: string }> }) {
  const session = await requirePermission("students")
  const { nis } = await params

  return (
    <Prefetched reads={[studentQuery(nis)]}>
      <StudentDetailView nis={nis} canEdit={canEdit(session.permissions, "students")} />
    </Prefetched>
  )
}
