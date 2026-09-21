import { PageHeader } from "@/src/components/layout/PageHeader"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { AssessmentTabs } from "./AssessmentTabs"

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await requirePermission("assessments")
  const { tab } = await searchParams

  return (
    <div className="stack stack-lg">
      <PageHeader title="Penilaian" subtitle="Semua bahan raport, satu periode." />

      <AssessmentTabs initialTab={tab} readOnly={!canEdit(session.role, "assessments")} />
    </div>
  )
}
