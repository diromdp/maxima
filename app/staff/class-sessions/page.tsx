import { PageHeader } from "@/src/components/layout/PageHeader"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { ClassSessionForm } from "./ClassSessionForm"

export default async function ClassSessionsPage() {
  const session = await requirePermission("class-sessions")

  return (
    <div className="stack stack-lg">
      <PageHeader title="Sesi Kelas" subtitle="Satu pertemuan, satu duduk." />

      <ClassSessionForm
        viewer={{
          name: session.name,
          role: session.role,
          branches: session.branches,
          canEdit: canEdit(session.role, "class-sessions"),
        }}
      />
    </div>
  )
}
