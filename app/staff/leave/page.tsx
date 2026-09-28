import { PageHeader } from "@/src/components/layout/PageHeader"
import { leaveOverviewQuery } from "@/src/entities/leave/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requirePermission } from "@/src/lib/auth/session"

import { LeaveOverview } from "./LeaveOverview"

export default async function LeavePage() {
  await requirePermission("leave")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Pengajuan Cuti"
        subtitle="Antrian dan pemantauan dalam satu halaman. Verifikasi Finance, verifikasi pembayaran, dan persetujuan akhir dikerjakan di halaman detail tiap pengajuan."
      />
      <Prefetched reads={[leaveOverviewQuery()]}>
        <LeaveOverview />
      </Prefetched>
    </div>
  )
}
