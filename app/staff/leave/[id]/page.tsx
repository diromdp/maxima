import { File01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { requirePermission } from "@/src/lib/auth/session"
import { formatDate, formatDateLong, formatDateTime } from "@/src/lib/format"
import { formatMoney, idr, shortfall as moneyShortfall } from "@/src/lib/money"

import { durationLabel, historyBadge, monthsBetween } from "../../../portal/leave/leave"
import { FinalApproval } from "../FinalApproval"
import { FinanceReview } from "../FinanceReview"
import { Field, Panel, PreviousLeavesPanel, TimelinePanel } from "../LeavePanels"
import { PaymentReview } from "../PaymentReview"
import {
  findLeave,
  isOverdue,
  remainingDays,
  remainingLabel,
  returnLabel,
  returnTone,
  type StaffLeave,
} from "../sample"

function DecisionPanel({ leave }: { leave: StaffLeave }) {
  switch (leave.state.kind) {
    case "awaiting-finance":
      return <FinanceReview leave={leave} />
    case "payment-set":
    case "awaiting-payment-check":
      return <PaymentReview leave={leave} />
    case "processing":
      return <FinalApproval leave={leave} />
    default:
      return null
  }
}

function ReturnPanel({ leave }: { leave: StaffLeave }) {
  const overdue = isOverdue(leave)

  return (
    <Panel
      title="Kesiapan Kembali & Kontak"
      aside={
        overdue ? (
          <button type="button" className="btn btn-danger btn-sm">
            Putuskan Tindak Lanjut
          </button>
        ) : undefined
      }
    >
      <div className="grid-2">
        <Field
          label="Status Kembali"
          value={<span className={`badge badge-${returnTone(leave)}`}>{returnLabel(leave)}</span>}
        />
        <Field
          label="Kelas Tujuan"
          value={`${leave.student.className} (level terakhir ${leave.student.level})`}
        />
        <Field label="Kontak Siswa" value={leave.student.phone} />
        <Field label="Kontak Darurat" value={leave.student.emergencyContact} />
      </div>
    </Panel>
  )
}

export default async function LeaveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("leave")
  const { id } = await params
  const leave = findLeave(id)
  if (!leave) notFound()

  const overdue = isOverdue(leave)
  const onLeave = leave.state.kind === "on-leave"
  const badge = historyBadge(leave.state)
  const finance = leave.finance
  const obligation = finance
    ? moneyShortfall(finance.minimumBeforeLeave, finance.totalPaid)
    : idr(0)
  const approvedAt = leave.stageTimes[7] ?? leave.stageTimes[6]

  return (
    <div className="stack stack-lg">
      <div className="stack stack-sm">
        <nav aria-label="Remah" className="caption text-muted">
          <Link href="/staff/leave" className="text-muted" style={{ textDecoration: "none" }}>
            Pengajuan Cuti
          </Link>{" "}
          / {leave.student.name}
        </nav>
        <PageHeader
          title={`Detail Cuti ${leave.student.name}`}
          badge={<span className={`badge badge-${badge.tone}`}>{badge.label}</span>}
          subtitle={`${leave.id} · diajukan ${formatDateTime(leave.submittedAt)}`}
          actions={
            <Link className="btn btn-secondary" href="/staff/leave">
              Kembali ke Daftar
            </Link>
          }
        />
      </div>

      {overdue && (
        <Notice tone="danger" title={`Lewat batas selesai ${Math.abs(remainingDays(leave))} hari`}>
          Rencana kembali {leave.returnDate ? formatDateLong(leave.returnDate) : "-"} terlewat tanpa
          konfirmasi. Hubungi siswa dulu; Admission yang memutuskan, sistem tidak mengubah status
          diam-diam.
        </Notice>
      )}

      <div className="grid-main-aside">
        <div className="stack">
          <Panel title="Identitas & Posisi Akademik">
            <div className="grid-2">
              <Field label="Nama, NIS" value={`${leave.student.name}, ${leave.student.nis}`} />
              <Field
                label="Program & Kelas"
                value={`${leave.student.packageName} · ${leave.student.className}`}
              />
              <Field label="Posisi kurikulum" value={leave.position} />
              <Field label="Cabang" value={leave.student.branch} />
            </div>
          </Panel>

          <Panel title="Periode & Keputusan">
            <div className="grid-2">
              <Field label="Diajukan" value={formatDateTime(leave.submittedAt)} />
              <Field label="Disetujui" value={approvedAt ? formatDateTime(approvedAt) : "-"} />
              <Field label="Mulai Cuti" value={formatDateLong(leave.start)} />
              <Field
                label="Rencana Kembali"
                value={leave.returnDate ? formatDateLong(leave.returnDate) : "-"}
              />
            </div>
            <div className="grid-2">
              <div className="card-soft stack" style={{ gap: 2, padding: 12 }}>
                <span className="caption text-muted">Durasi</span>
                <span className="h5 tabular">{durationLabel(leave)}</span>
                <span className="caption text-muted">
                  {monthsBetween(leave.start, leave.end)} dari maksimal 6 bulan
                </span>
              </div>
              <div className="card-soft stack" style={{ gap: 2, padding: 12 }}>
                <span className="caption text-muted">Sisa</span>
                <span className={`h5 tabular${overdue ? " text-danger" : ""}`}>
                  {remainingLabel(leave)}
                </span>
                <span className="caption text-muted">berakhir {formatDate(leave.end)}</span>
              </div>
            </div>
          </Panel>

          <Panel title="Alasan & Dokumen Pendukung">
            <Field label="Alasan cuti" value={leave.reason} />
            <div className="row-soft">
              <span className="row body-sm" style={{ gap: 8, minWidth: 0 }}>
                <HugeiconsIcon icon={File01Icon} size={16} strokeWidth={1.5} />
                {leave.document.name}
              </span>
              <a
                className="btn btn-secondary btn-sm"
                href={leave.document.href}
                target="_blank"
                rel="noreferrer"
              >
                Pratinjau
              </a>
            </div>
          </Panel>

          <DecisionPanel leave={leave} />

          {onLeave && <ReturnPanel leave={leave} />}
        </div>

        <div className="stack" style={{ alignSelf: "start" }}>
          <Panel title="Verifikasi Keuangan">
            <Field
              label="Kewajiban"
              value={obligation.amount > 0 ? formatMoney(obligation) : "Tidak ada tagihan tambahan"}
            />
            <Field
              label="Pembayaran"
              value={
                finance
                  ? `${formatMoney(finance.totalPaid)} dari minimum ${formatMoney(finance.minimumBeforeLeave)}`
                  : "-"
              }
            />
            <Field
              label="Verifikator"
              value={
                leave.financeVerifier
                  ? `${leave.financeVerifier}${leave.verifiedAt ? `, ${formatDateTime(leave.verifiedAt)}` : ""}`
                  : "-"
              }
            />
          </Panel>
          <TimelinePanel leave={leave} />
          <PreviousLeavesPanel leave={leave} />
        </div>
      </div>
    </div>
  )
}
