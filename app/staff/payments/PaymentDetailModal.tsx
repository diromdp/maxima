"use client"

import { Group, Modal, Skeleton, Textarea } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { Notice } from "@/src/components/ui/Notice"
import { ratifyPayment, rejectPayment } from "@/src/entities/payment/actions"
import { PAYMENT_KEYS, paymentQuery } from "@/src/entities/payment/queries"
import {
  isValidPayment,
  LANE_LABEL,
  PAYMENT_STATUS_BADGE,
  type PaymentDetail,
  rejectFormSchema,
} from "@/src/entities/payment/schema"
import { openRenderedFile, previewPresigned } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"
import { useActionForm } from "@/src/lib/use-action-form"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="stack" style={{ gap: 2, minWidth: 0 }}>
      <span className="caption text-muted">{label}</span>
      <span className="body-sm" style={{ fontWeight: 600, overflowWrap: "anywhere" }}>
        {value}
      </span>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <div className="row row-between" aria-hidden>
        <Skeleton height={28} width="40%" radius="xl" />
        <Skeleton height={22} width={80} radius="xl" />
      </div>
      <div className="grid-2" aria-hidden>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="stack" style={{ gap: 4 }}>
            <Skeleton height={12} width="40%" radius="xl" />
            <Skeleton height={16} width="70%" radius="xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

const SELF_RECORDED =
  "Anda yang mencatat pembayaran ini, jadi pengesahannya dilakukan Manajer Finance lain."

async function printReceipt(payment: PaymentDetail) {
  try {
    await openRenderedFile(`/print/receipts/${payment.id}`)
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    notify.error(error.message)
  }
}

export function PaymentDetailModal({
  paymentId,
  canRatify,
  viewerId,
  onClose,
}: {
  paymentId: string
  canRatify: boolean
  viewerId: string
  onClose: () => void
}) {
  const detail = useRead(paymentQuery(paymentId))

  return (
    <Modal opened onClose={onClose} title="Detail Pembayaran" styles={TITLE_STYLE}>
      {detail.isError ? (
        <QueryError message={detail.error.message} onRetry={() => void detail.refetch()} />
      ) : detail.data ? (
        <PaymentDetailBody
          payment={detail.data}
          canRatify={canRatify}
          isRecorder={detail.data.recordedByUserId === viewerId}
          onClose={onClose}
        />
      ) : (
        <DetailSkeleton />
      )}
    </Modal>
  )
}

function PaymentDetailBody({
  payment,
  canRatify,
  isRecorder,
  onClose,
}: {
  payment: PaymentDetail
  canRatify: boolean
  isRecorder: boolean
  onClose: () => void
}) {
  const [isRejecting, setIsRejecting] = useState(false)
  const amount = formatMoney({ amount: payment.amount, currency: payment.currency })
  const isAwaiting = payment.status === "Menunggu"

  const ratifyForm = useForm({ initialValues: {} })
  const rejectForm = useForm<{ reason: string }>({
    initialValues: { reason: "" },
    validate: schemaResolver(rejectFormSchema, { sync: true }),
  })
  const ratify = useActionForm({
    form: ratifyForm,
    action: () => ratifyPayment(payment.id),
    successMessage: `Pembayaran ${amount} ${payment.student.name} disahkan.`,
    invalidates: PAYMENT_KEYS,
    onSuccess: onClose,
  })
  const reject = useActionForm({
    form: rejectForm,
    action: (values) => rejectPayment(payment.id, values.reason),
    successMessage: `Pembayaran ${payment.student.name} ditolak. Catatannya tetap tersimpan.`,
    invalidates: PAYMENT_KEYS,
    onSuccess: onClose,
  })
  const isPending = ratify.isPending || reject.isPending
  const formError = ratify.formError ?? reject.formError

  return (
    <div className="stack stack-lg">
      <div className="row row-between">
        <span className="h5 tabular">{amount}</span>
        <span className={`badge ${PAYMENT_STATUS_BADGE[payment.status]}`}>{payment.status}</span>
      </div>

      {formError && <Notice tone="danger">{formError}</Notice>}

      <div className="grid-2">
        <Field
          label="Siswa"
          value={`${payment.student.name} · ${payment.student.nis ?? "Belum ber-NIS"}`}
        />
        <Field label="No. Kontrak" value={payment.contractNumber ?? "Belum terbit"} />
        <Field label="Tanggal" value={formatDate(payment.paidOn)} />
        <Field
          label="Jalur · Metode"
          value={`${LANE_LABEL[payment.currency]} · ${payment.method}`}
        />
        <Field label="Cabang" value={payment.branch?.name ?? DASH} />
        {payment.orderId && <Field label="ID Transaksi" value={payment.orderId} />}
        {payment.receivedByName && <Field label="Penerima" value={payment.receivedByName} />}
        {payment.recordedBy && <Field label="Dicatat oleh" value={payment.recordedBy} />}
        {payment.ratifiedBy && (
          <Field
            label={payment.status === "Ditolak" ? "Ditolak oleh" : "Disahkan oleh"}
            value={payment.ratifiedBy}
          />
        )}
      </div>

      {payment.note && <Field label="Catatan" value={payment.note} />}
      {payment.hasProof && (
        <Field
          label="Bukti Pembayaran"
          value={
            <button
              type="button"
              className="link"
              onClick={() => void previewPresigned(`/payments/${payment.id}/proof`)}
            >
              Buka bukti pembayaran
            </button>
          }
        />
      )}
      {payment.rejectReason && (
        <Field
          label="Alasan penolakan"
          value={<span className="text-danger">{payment.rejectReason}</span>}
        />
      )}

      {isValidPayment(payment) && (
        <Group justify="flex-end">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void printReceipt(payment)}
          >
            Cetak Kwitansi
          </button>
        </Group>
      )}

      {isAwaiting && !canRatify && (
        <span className="caption text-muted">
          Menunggu pengesahan Manajer Finance. Yang menerima uang bukan yang menyetujuinya.
        </span>
      )}

      {isAwaiting && canRatify && !isRejecting && (
        <form className="stack" onSubmit={ratify.submit} noValidate>
          <Group justify="flex-end">
            <button
              type="button"
              className="btn btn-danger"
              disabled={isPending}
              onClick={() => setIsRejecting(true)}
            >
              Tolak
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending || isRecorder}
              title={isRecorder ? SELF_RECORDED : undefined}
            >
              {ratify.isPending ? "Menyimpan..." : "Sahkan"}
            </button>
          </Group>
          {isRecorder && <span className="caption text-muted">{SELF_RECORDED}</span>}
        </form>
      )}

      {isAwaiting && canRatify && isRejecting && (
        <form className="stack" onSubmit={reject.submit} noValidate>
          <Textarea
            label="Alasan penolakan"
            description="Dibaca siswa dan Staf Finance. Catatan tidak dihapus, hanya ditandai Ditolak."
            placeholder="Contoh: bukti tidak terbaca, unggah ulang foto yang jelas."
            autosize
            minRows={2}
            withAsterisk
            data-autofocus
            {...rejectForm.getInputProps("reason")}
          />
          <Group justify="flex-end">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={isPending}
              onClick={() => setIsRejecting(false)}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-danger" disabled={isPending}>
              {reject.isPending ? "Menyimpan..." : "Tolak Pembayaran"}
            </button>
          </Group>
        </form>
      )}
    </div>
  )
}
