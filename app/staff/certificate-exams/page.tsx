import { PageHeader } from "@/src/components/layout/PageHeader"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { ExamTabs } from "./ExamTabs"

export default async function CertificateExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await requirePermission("certificate-exams")
  const { tab } = await searchParams

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Ujian & Sertifikat"
        subtitle="Ujian sertifikasi dari rekomendasi sampai nilai terverifikasi."
      />

      <ExamTabs
        initialTab={tab}
        readOnly={!canEdit(session.role, "certificate-exams")}
        viewerName={session.name}
      />
    </div>
  )
}
