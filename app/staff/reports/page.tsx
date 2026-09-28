import { PageHeader } from "@/src/components/layout/PageHeader"
import { reportPeriodsQuery } from "@/src/entities/report/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requirePermission } from "@/src/lib/auth/session"

import { ExportButton } from "./ExportButton"
import { ReportTabs } from "./ReportTabs"

export default async function ReportsPage() {
  await requirePermission("reports")

  return (
    <Prefetched reads={[reportPeriodsQuery()]}>
      <div className="stack stack-lg">
        <PageHeader
          title="Laporan Keuangan"
          subtitle="Seluruhnya hitungan dari paket, siswa, dan transaksi berlaku. Rupiah dan Euro terpisah."
          actions={<ExportButton />}
        />

        <ReportTabs />
      </div>
    </Prefetched>
  )
}
