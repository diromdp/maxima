import { PageHeader } from "@/src/components/layout/PageHeader"
import { certificatesQuery } from "@/src/entities/certificate/queries"
import { CERTIFICATE_FILTERS, certificateFiltersOf } from "@/src/entities/certificate/schema"
import { masterItemsQuery } from "@/src/entities/master-data/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { ExamTabs } from "./ExamTabs"

export default async function CertificateExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requirePermission("certificate-exams")
  const filters = certificateFiltersOf(
    listParamsOf(searchParamsSource(await searchParams), CERTIFICATE_FILTERS),
  )

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Ujian & Sertifikat"
        subtitle="Ujian sertifikasi dari rekomendasi sampai nilai terverifikasi."
      />

      <Prefetched reads={[certificatesQuery(filters), masterItemsQuery()]}>
        <ExamTabs
          readOnly={!canEdit(session.permissions, "certificate-exams")}
          viewerName={session.name}
        />
      </Prefetched>
    </div>
  )
}
