import { PageHeader } from "@/src/components/layout/PageHeader"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { ReportQueue } from "./ReportQueue"
import { PERIOD } from "./sample"

export default async function ReportCardsPage() {
  const session = await requirePermission("report-cards")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Raport"
        subtitle={`Antrian penerbitan periode ${PERIOD.label}. Nilai, sikap, dan absensi ditarik dari Penilaian dan Sesi Kelas.`}
      />

      <ReportQueue readOnly={!canEdit(session.role, "report-cards")} />
    </div>
  )
}
