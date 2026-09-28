"use client"

import { Skeleton } from "@mantine/core"
import Link from "next/link"

import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { leaveQuery } from "@/src/entities/leave/queries"
import {
  type LeaveDetail,
  leaveMonths,
  MAX_LEAVE_MONTHS,
  positionLabel,
  remainingLabel,
  STATE_BADGE,
} from "@/src/entities/leave/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate, formatDateLong, formatDateTime } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"

import { FinalApproval, obligationLabel } from "./FinalApproval"
import { FinanceReview } from "./FinanceReview"
import { Field, FileRow, Panel, PreviousLeavesPanel, TimelinePanel } from "./LeavePanels"
import { PaymentReview } from "./PaymentReview"
import { ReturnReview } from "./ReturnReview"

export type LeaveAbilities = {
  readonly canAssess: boolean
  readonly canVerifyPayment: boolean
  readonly canApprove: boolean
  readonly viewerId: string
}

function DecisionPanel({ leave, abilities }: { leave: LeaveDetail; abilities: LeaveAbilities }) {
  switch (leave.state) {
    case "awaiting-finance":
      return <FinanceReview leave={leave} canDecide={abilities.canAssess} />
    case "payment-set":
    case "awaiting-payment-check":
      return (
        <PaymentReview
          leave={leave}
          canDecide={abilities.canVerifyPayment}
          isAssessor={leave.finance.assessedByUserId === abilities.viewerId}
        />
      )
    case "processing":
      return <FinalApproval leave={leave} canDecide={abilities.canApprove} />
    case "on-leave":
      return <ReturnReview leave={leave} canDecide={abilities.canApprove} />
    default:
      return null
  }
}

function ClosedNotice({ leave }: { leave: LeaveDetail }) {
  if (leave.state === "rejected") {
    return (
      <Notice tone="danger" title="Pengajuan ditolak">
        {leave.rejectReason}
        {leave.reapplyFrom && ` Dapat diajukan ulang mulai ${formatDateLong(leave.reapplyFrom)}.`}
      </Notice>
    )
  }
  if (leave.state === "expired") {
    return (
      <Notice tone="danger" title="Pengajuan gugur">
        Batas pembayaran {leave.finance.deadline ? formatDateLong(leave.finance.deadline) : ""}{" "}
        terlewat tanpa bukti. Bukti dan keputusan tidak dapat dikirim lagi; siswa mengajukan ulang.
      </Notice>
    )
  }
  return null
}

function LeaveBody({ leave, abilities }: { leave: LeaveDetail; abilities: LeaveAbilities }) {
  const isOverdue = leave.returnStatus === "Lewat Batas"
  const months = leaveMonths(leave.startsOn, leave.returnsOn)
  const { paidIdr, minimumIdr, verifiedBy, verifiedAt } = leave.finance

  return (
    <>
      {isOverdue && (
        <Notice tone="danger" title={`Lewat batas selesai ${Math.abs(leave.remainingDays)} hari`}>
          Rencana kembali {formatDateLong(leave.returnsOn)} terlewat tanpa konfirmasi. Hubungi siswa
          dulu; Admission yang memutuskan, sistem tidak mengubah status diam-diam.
        </Notice>
      )}
      <ClosedNotice leave={leave} />

      <div className="grid-main-aside">
        <div className="stack">
          <Panel title="Identitas & Posisi Akademik">
            <div className="grid-2">
              <Field
                label="Nama, NIS"
                value={`${leave.student.name}, ${leave.student.nis ?? "-"}`}
              />
              <Field
                label="Program & Kelas"
                value={[leave.program, leave.position.className].filter(Boolean).join(" · ") || "-"}
              />
              <Field
                label="Posisi kurikulum"
                value={positionLabel(leave.frozenPosition ?? leave.position)}
              />
              <Field label="Cabang" value={leave.student.branch ?? "-"} />
            </div>
          </Panel>

          <Panel title="Periode & Keputusan">
            <div className="grid-2">
              <Field label="Diajukan" value={formatDateTime(leave.submittedAt)} />
              <Field
                label="Disetujui"
                value={leave.approvedAt ? formatDateTime(leave.approvedAt) : "-"}
              />
              <Field label="Mulai Cuti" value={formatDateLong(leave.startsOn)} />
              <Field label="Rencana Kembali" value={formatDateLong(leave.returnsOn)} />
            </div>
            <div className="grid-2">
              <div className="card-soft stack" style={{ gap: 2, padding: 12 }}>
                <span className="caption text-muted">Durasi</span>
                <span className="h5 tabular">{months} bulan</span>
                <span className="caption text-muted">
                  {months} dari maksimal {MAX_LEAVE_MONTHS} bulan
                </span>
              </div>
              <div className="card-soft stack" style={{ gap: 2, padding: 12 }}>
                <span className="caption text-muted">Sisa</span>
                <span className={`h5 tabular${isOverdue ? " text-danger" : ""}`}>
                  {remainingLabel(leave.remainingDays)}
                </span>
                <span className="caption text-muted">berakhir {formatDate(leave.returnsOn)}</span>
              </div>
            </div>
          </Panel>

          <Panel title="Alasan & Dokumen Pendukung">
            <Field label="Alasan cuti" value={leave.reason} />
            {leave.hasEvidence ? (
              <FileRow name="Dokumen Pendukung" path={`/leaves/${leave.id}/evidence`} />
            ) : (
              <span className="body-sm text-muted">Tidak ada dokumen pendukung.</span>
            )}
          </Panel>

          <DecisionPanel leave={leave} abilities={abilities} />
        </div>

        <div className="stack" style={{ alignSelf: "start" }}>
          <Panel title="Verifikasi Keuangan">
            <Field
              label="Kewajiban"
              value={
                leave.state === "awaiting-finance" ? "Belum ditetapkan" : obligationLabel(leave)
              }
            />
            <Field
              label="Pembayaran"
              value={`${formatMoney(idr(paidIdr))} dari minimum ${formatMoney(idr(minimumIdr))}`}
            />
            <Field
              label="Verifikator"
              value={
                verifiedAt
                  ? `${verifiedBy ?? "Otomatis dari pembayaran"}, ${formatDateTime(verifiedAt)}`
                  : "-"
              }
            />
          </Panel>
          <TimelinePanel leave={leave} />
          <PreviousLeavesPanel leave={leave} />
        </div>
      </div>
    </>
  )
}

export function LeaveDetailView({ id, abilities }: { id: string; abilities: LeaveAbilities }) {
  const leave = useRead(leaveQuery(id))
  const badge = leave.data ? STATE_BADGE[leave.data.state] : null

  return (
    <div className="stack stack-lg">
      <div className="stack stack-sm">
        <nav aria-label="Remah" className="caption text-muted">
          <Link href="/staff/leave" className="text-muted" style={{ textDecoration: "none" }}>
            Pengajuan Cuti
          </Link>{" "}
          / {leave.data?.student.name ?? "Detail"}
        </nav>
        <PageHeader
          title={leave.data ? `Detail Cuti ${leave.data.student.name}` : "Detail Cuti"}
          badge={badge && <span className={`badge badge-${badge.tone}`}>{badge.label}</span>}
          subtitle={
            leave.data
              ? `${leave.data.number} · diajukan ${formatDateTime(leave.data.submittedAt)}`
              : undefined
          }
          actions={
            <Link className="btn btn-secondary" href="/staff/leave">
              Kembali ke Daftar
            </Link>
          }
        />
      </div>

      {leave.isError ? (
        <QueryError message={leave.error.message} onRetry={() => void leave.refetch()} />
      ) : leave.isPending ? (
        <LeaveDetailSkeleton />
      ) : (
        <LeaveBody leave={leave.data} abilities={abilities} />
      )}
    </div>
  )
}

export function LeaveDetailSkeleton() {
  return (
    <div className="grid-main-aside" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <div className="stack" aria-hidden>
        {[160, 200, 140, 220].map((height) => (
          <Skeleton key={height} height={height} radius="md" />
        ))}
      </div>
      <div className="stack" aria-hidden>
        {[180, 320, 120].map((height) => (
          <Skeleton key={height} height={height} radius="md" />
        ))}
      </div>
    </div>
  )
}
