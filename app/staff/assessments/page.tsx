import { PageHeader } from "@/src/components/layout/PageHeader"
import { assessmentFiltersQuery } from "@/src/entities/assessment/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit, canView } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { AssessmentTabs } from "./AssessmentTabs"

export default async function AssessmentsPage() {
  const session = await requirePermission("assessments")

  return (
    <div className="stack stack-lg">
      <PageHeader title="Penilaian" subtitle="Semua bahan raport, satu periode." />

      <Prefetched reads={[assessmentFiltersQuery()]}>
        <AssessmentTabs
          readOnly={!canEdit(session.permissions, "assessments")}
          canDownloadReport={canView(session.permissions, "report-cards")}
        />
      </Prefetched>
    </div>
  )
}
