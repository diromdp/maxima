"use client"

import { useForm } from "@mantine/form"
import { useState } from "react"

import { FormModal } from "@/src/components/ui/FormModal"
import { Notice } from "@/src/components/ui/Notice"
import { decideApproval } from "@/src/entities/leave/actions"
import { type LeaveDetail, leaveMonths, positionLabel } from "@/src/entities/leave/schema"
import { formatDateLong, formatDateTime } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"
import { useActionForm } from "@/src/lib/use-action-form"

import { Field, Panel } from "./LeavePanels"
import { RejectModal } from "./RejectModal"

export const obligationLabel = (leave: LeaveDetail) =>
  leave.finance.amountIdr ? formatMoney(idr(leave.finance.amountIdr)) : "Tidak ada tagihan tambahan"

function ApproveModal({ leave, onClose }: { leave: LeaveDetail; onClose: () => void }) {
  const form = useForm({ initialValues: {} })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: () => decideApproval(leave.id, { decision: "approve" }),
    successMessage: `Cuti ${leave.student.name} disetujui. Tercatat di Log Aktivitas dan Riwayat Cuti siswa.`,
    invalidates: [["leaves"], ["students"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title="Setujui Cuti"
      submitLabel="Konfirmasi Persetujuan"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <div className="grid-2">
        <Field
          label="Periode"
          value={`${formatDateLong(leave.startsOn)} - ${formatDateLong(leave.returnsOn)}`}
        />
        <Field label="Durasi" value={`${leaveMonths(leave.startsOn, leave.returnsOn)} bulan`} />
        <Field
          label="Posisi kelas saat ini"
          value={[leave.position.className, positionLabel(leave.position)]
            .filter(Boolean)
            .join(" · ")}
        />
        <Field label="Rencana kembali" value={formatDateLong(leave.returnsOn)} />
      </div>
      <Notice tone="success">
        Status {leave.student.name} berubah menjadi Cuti pada {formatDateLong(leave.startsOn)}. Saat
        itu ia keluar dari anggota kelas, posisi kurikulumnya dibekukan, dan tagihan berhenti.
        Pembayaran yang masuk tetap membuka gerbang layanan.
      </Notice>
    </FormModal>
  )
}

export function FinalApproval({ leave, canDecide }: { leave: LeaveDetail; canDecide: boolean }) {
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null)
  const close = () => setDialog(null)
  const { verifiedBy, verifiedAt } = leave.finance

  return (
    <>
      <Panel title="Keputusan Persetujuan">
        <Notice tone="info">
          Tidak ada yang dinilai ulang di sini. Tombol ini ada karena siswa tidak boleh mengubah
          statusnya sendiri.
        </Notice>
        <div className="grid-2">
          <Field
            label="Status Keuangan"
            value={<span className="badge badge-beres">Pembayaran Diverifikasi</span>}
          />
          <Field label="Total Kewajiban" value={obligationLabel(leave)} />
          <Field
            label="Verifikasi oleh"
            value={verifiedBy ?? (verifiedAt ? "Otomatis dari pembayaran" : "-")}
          />
          <Field label="Diverifikasi pada" value={verifiedAt ? formatDateTime(verifiedAt) : "-"} />
        </div>
        {canDecide ? (
          <div className="row row-wrap" style={{ gap: 8 }}>
            <button type="button" className="btn btn-primary" onClick={() => setDialog("approve")}>
              Setujui Cuti
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setDialog("reject")}>
              Tolak Pengajuan Cuti
            </button>
          </div>
        ) : (
          <span className="caption text-muted">Keputusan tahap ini dikerjakan Admission.</span>
        )}
      </Panel>

      {dialog === "approve" && <ApproveModal leave={leave} onClose={close} />}
      {dialog === "reject" && (
        <RejectModal
          leave={leave}
          reject={(values) => decideApproval(leave.id, { decision: "reject", ...values })}
          onClose={close}
        />
      )}
    </>
  )
}
