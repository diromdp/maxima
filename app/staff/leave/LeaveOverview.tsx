"use client"

import { Skeleton } from "@mantine/core"

import { QueryError } from "@/src/components/data/QueryError"
import { Notice } from "@/src/components/ui/Notice"
import { leaveOverviewQuery } from "@/src/entities/leave/queries"
import { useRead } from "@/src/lib/api/use-read"

import { Panel } from "./LeavePanels"
import { RunningLeaveTable } from "./RunningLeaveTable"
import { VerificationTable } from "./VerificationTable"

export function LeaveOverview() {
  const overview = useRead(leaveOverviewQuery())

  if (overview.isError) {
    return <QueryError message={overview.error.message} onRetry={() => void overview.refetch()} />
  }
  if (overview.isPending) return <LeaveOverviewSkeleton />

  const { summary, running, pending } = overview.data
  const overdueCount = running.filter((leave) => leave.returnStatus === "Lewat Batas").length
  const figures = [
    { label: "Total Cuti Aktif", value: summary.activeLeaves, caption: "sedang menjalani cuti" },
    {
      label: "Menunggu Finance",
      value: summary.awaitingFinance,
      caption: "belum dinilai Staf Finance",
    },
    {
      label: "Menunggu Pembayaran",
      value: summary.awaitingPayment,
      caption: "kewajiban sudah ditetapkan",
    },
    {
      label: "Pembayaran Diverifikasi",
      value: summary.paymentVerified,
      caption: "menunggu Admission",
    },
  ]

  return (
    <>
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
        {overdueCount > 0 && (
          <Notice tone="danger">
            {overdueCount} siswa melewati tanggal selesai tanpa konfirmasi kembali. Admission yang
            memutuskan, sistem tidak mengubah status diam-diam.
          </Notice>
        )}
        <RunningLeaveTable rows={running} />
      </Panel>

      <Panel
        title="Verifikasi Finance"
        aside={<span className="pill tabular">{pending.length} pengajuan</span>}
      >
        <VerificationTable rows={pending} />
      </Panel>
    </>
  )
}

export function LeaveOverviewSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <section className="card" aria-hidden>
        <div className="grid-4">
          {[0, 1, 2, 3].map((figure) => (
            <div key={figure} className="stack stack-sm">
              <Skeleton height={14} width="70%" radius="xl" />
              <Skeleton height={28} width="40%" radius="xl" />
              <Skeleton height={12} width="85%" radius="xl" />
            </div>
          ))}
        </div>
      </section>

      {[0, 1].map((table) => (
        <section key={table} className="card stack" aria-hidden>
          <Skeleton height={24} width="30%" radius="xl" />
          <Skeleton height={32} width="45%" radius="xl" />
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} height={52} radius="sm" />
          ))}
        </section>
      ))}
    </div>
  )
}
