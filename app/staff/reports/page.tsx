import { PageHeader } from "@/src/components/layout/PageHeader"
import { requirePermission } from "@/src/lib/auth/session"

import { ExportButton } from "./ExportButton"
import { ReportTabs } from "./ReportTabs"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  await requirePermission("reports")
  const { tab } = await searchParams

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Laporan Keuangan"
        subtitle="Seluruhnya hitungan dari paket, siswa, dan transaksi berlaku. Rupiah dan Euro terpisah."
        actions={<ExportButton />}
      />

      <ReportTabs initialTab={tab} />
    </div>
  )
}
