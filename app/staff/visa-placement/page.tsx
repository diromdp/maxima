import { PageHeader } from "@/src/components/layout/PageHeader"
import { requirePermission } from "@/src/lib/auth/session"

import { AlumniTable } from "./AlumniTable"

export default async function VisaPlacementPage() {
  await requirePermission("visa-placement")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Visa & Penempatan"
        subtitle="Data visa, kontrak kerja, dan keberangkatan kandidat menuju Jerman. Mengisi tanggal keberangkatan menyalakan status Alumni."
      />

      <AlumniTable />
    </div>
  )
}
