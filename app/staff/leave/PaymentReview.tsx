"use client"

import { Textarea } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"
import { useState } from "react"

import { FormModal } from "@/src/components/ui/FormModal"
import { Notice } from "@/src/components/ui/Notice"
import { checkPayment } from "@/src/entities/leave/actions"
import { type LeaveDetail, proofRejectionFormSchema } from "@/src/entities/leave/schema"
import { formatDateLong } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"
import { useActionForm } from "@/src/lib/use-action-form"

import { Field, FileRow, Panel } from "./LeavePanels"
import { RejectModal } from "./RejectModal"

type Dialog = "verify" | "reject-proof" | "reject" | null

const NO_PROOF = "Verifikasi terbuka setelah siswa mengunggah bukti pembayaran."
const SELF_ASSESSED =
  "Anda yang menetapkan kewajiban cuti ini, jadi pembayarannya diverifikasi Staf Finance lain atau Manajer Finance."

const obligationOf = (leave: LeaveDetail) =>
  leave.finance.amountIdr === null ? "-" : formatMoney(idr(leave.finance.amountIdr))

const deadlineOf = (leave: LeaveDetail) =>
  leave.finance.deadline ? `${formatDateLong(leave.finance.deadline)} pukul 23.59 WIB` : "-"

function VerifyModal({
  leave,
  onRejectProof,
  onClose,
}: {
  leave: LeaveDetail
  onRejectProof: () => void
  onClose: () => void
}) {
  const form = useForm({ initialValues: {} })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: () => checkPayment(leave.id, { decision: "verify" }),
    successMessage: `Pembayaran ${leave.student.name} diverifikasi. Pengajuan pindah ke Persetujuan Akhir.`,
    invalidates: [["leaves"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title="Verifikasi Bukti Pembayaran"
      size="lg"
      submitLabel="Verifikasi Pembayaran"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <div className="grid-2">
        <Field label="Siswa" value={`${leave.student.name} · ${leave.student.nis ?? "-"}`} />
        <Field label="Nominal" value={obligationOf(leave)} />
      </div>
      <FileRow name="Bukti Pembayaran" path={`/leaves/${leave.id}/proof`} />
      <div className="row row-between row-wrap">
        <span className="caption text-muted">
          Bukti tidak sesuai? Siswa diminta mengunggah ulang.
        </span>
        <button type="button" className="btn btn-danger btn-sm" onClick={onRejectProof}>
          Tolak Bukti
        </button>
      </div>
    </FormModal>
  )
}

function RejectProofModal({ leave, onClose }: { leave: LeaveDetail; onClose: () => void }) {
  const form = useForm({
    initialValues: { reason: "" },
    validate: schemaResolver(proofRejectionFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => checkPayment(leave.id, { decision: "reject-proof", ...values }),
    successMessage: `Bukti ${leave.student.name} ditolak. Siswa diminta mengunggah ulang sebelum batas waktu.`,
    invalidates: [["leaves"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title="Tolak Bukti Pembayaran"
      submitLabel="Tolak Bukti"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <span className="body-sm text-muted">
        Berkas bukti dihapus dan pengajuan kembali ke Menunggu Pembayaran. Siswa mengunggah ulang
        sebelum {deadlineOf(leave)}.
      </span>
      <Textarea
        label="Alasan"
        description="Dibaca siswa apa adanya."
        autosize
        minRows={3}
        withAsterisk
        {...form.getInputProps("reason")}
      />
    </FormModal>
  )
}

export function PaymentReview({
  leave,
  canDecide,
  isAssessor,
}: {
  leave: LeaveDetail
  canDecide: boolean
  isAssessor: boolean
}) {
  const [dialog, setDialog] = useState<Dialog>(null)
  const close = () => setDialog(null)
  const { hasProof } = leave
  const verifyBlocker = !hasProof ? NO_PROOF : isAssessor ? SELF_ASSESSED : null

  return (
    <>
      <Panel title="Kelengkapan Pembayaran">
        <div className="grid-2">
          <Field
            label="Status Keuangan"
            value={
              <span className={`badge ${hasProof ? "badge-terbuka" : "badge-berjalan"}`}>
                {hasProof ? "Menunggu Verifikasi Pembayaran" : "Menunggu Pembayaran"}
              </span>
            }
          />
          <Field label="Total Kewajiban" value={obligationOf(leave)} />
          <Field
            label="Verifikasi Pembayaran"
            value={hasProof ? "Bukti terkirim, belum diperiksa" : "Belum ada bukti"}
          />
          <Field label="Batas Waktu" value={deadlineOf(leave)} />
        </div>

        <div className="stack" style={{ gap: 4 }}>
          <span className="caption text-muted">Bukti Pembayaran</span>
          {hasProof ? (
            <FileRow name="Bukti Pembayaran" path={`/leaves/${leave.id}/proof`} />
          ) : (
            <Notice tone="warning">
              Siswa belum mengunggah bukti. Batas waktu {deadlineOf(leave)}; lewat itu pengajuan
              gugur.
            </Notice>
          )}
        </div>

        {canDecide ? (
          <div className="row row-wrap" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={verifyBlocker !== null}
              title={verifyBlocker ?? undefined}
              onClick={() => setDialog("verify")}
            >
              Verifikasi Pembayaran
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setDialog("reject")}>
              Tolak Pengajuan Cuti
            </button>
            {verifyBlocker && <span className="caption text-muted">{verifyBlocker}</span>}
          </div>
        ) : (
          <span className="caption text-muted">
            Keputusan tahap ini dikerjakan Staf Finance atau Manajer Finance.
          </span>
        )}
      </Panel>

      {dialog === "verify" && (
        <VerifyModal
          leave={leave}
          onRejectProof={() => setDialog("reject-proof")}
          onClose={close}
        />
      )}
      {dialog === "reject-proof" && <RejectProofModal leave={leave} onClose={close} />}
      {dialog === "reject" && (
        <RejectModal
          leave={leave}
          reject={(values) => checkPayment(leave.id, { decision: "reject", ...values })}
          onClose={close}
        />
      )}
    </>
  )
}
