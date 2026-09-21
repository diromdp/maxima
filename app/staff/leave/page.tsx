import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { requirePermission } from "@/src/lib/auth/session"

import { Panel } from "./LeavePanels"
import { RunningLeaveTable } from "./RunningLeaveTable"
import { VerificationTable } from "./VerificationTable"
import {
  DECISION_STATES,
  isOverdue,
  LEAVES,
  leavesInState,
  monitoringCounts,
  remainingDays,
} from "./sample"

export default async function LeavePage() {
  await requirePermission("leave")

  const counts = monitoringCounts(LEAVES)
  const inVerification = leavesInState(DECISION_STATES)
  const running = LEAVES.filter((leave) => leave.state.kind === "on-leave").sort(
    (a, b) => remainingDays(a) - remainingDays(b),
  )
  const overdue = running.filter((leave) => isOverdue(leave))

  const figures = [
    { label: "Total Cuti Aktif", value: counts.active, caption: "sedang menjalani cuti" },
    {
      label: "Menunggu Finance",
      value: counts.awaitingFinance,
      caption: "belum dinilai Staf Finance",
    },
    {
      label: "Menunggu Pembayaran",
      value: counts.awaitingPayment,
      caption: "kewajiban sudah ditetapkan",
    },
    {
      label: "Pembayaran Diverifikasi",
      value: counts.paymentVerified,
      caption: "menunggu Admission",
    },
  ]

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Pengajuan Cuti"
        subtitle="Antrian dan pemantauan dalam satu halaman. Verifikasi Finance, verifikasi pembayaran, dan persetujuan akhir dikerjakan di halaman detail tiap pengajuan."
      />

      <section className="card">
        <div className="grid-4">
          {figures.map(({ label, value, caption }) => (
            <div key={label} className="stack stack-sm">
              <span className="label text-muted">{label}</span>
              <span className="h4 tabular">{value}</span>
              <span className="caption text-muted">{caption}</span>
            </div>
          ))}
        </div>
      </section>

      <Panel
        title="Daftar Cuti Sedang Berjalan"
        aside={<span className="pill tabular">{running.length} siswa</span>}
      >
        {overdue.length > 0 && (
          <Notice tone="danger">
            {overdue.length} siswa melewati tanggal selesai tanpa konfirmasi kembali. Admission yang
            memutuskan, sistem tidak mengubah status diam-diam.
          </Notice>
        )}
        <RunningLeaveTable rows={running} />
      </Panel>

      <Panel
        title="Verifikasi Finance"
        aside={<span className="pill tabular">{inVerification.length} pengajuan</span>}
      >
        <VerificationTable rows={inVerification} />
      </Panel>
    </div>
  )
}
