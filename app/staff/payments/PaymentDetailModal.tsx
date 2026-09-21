"use client"

import { Group, Modal, Textarea } from "@mantine/core"
import { useState } from "react"

import { formatDate } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"

import {
  isValid,
  needsRatification,
  type PaymentRow,
  receiptKey,
  receiptKind,
  STATUS_BADGE,
} from "./sample"

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

export function PaymentDetailModal({
  row,
  canRatify,
  onClose,
}: {
  row: PaymentRow
  canRatify: boolean
  onClose: () => void
}) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState("")

  return (
    <Modal opened onClose={onClose} title="Detail Pembayaran" styles={TITLE_STYLE}>
      <div className="stack stack-lg">
        <div className="row row-between">
          <span className="h5 tabular">{formatMoney(row.amount)}</span>
          <span className={`badge ${STATUS_BADGE[row.status]}`}>{row.status}</span>
        </div>

        <div className="grid-2">
          <Field label="Siswa" value={`${row.studentName} · ${row.nis}`} />
          <Field label="No. Kontrak" value={row.contractNumber ?? "Belum terbit"} />
          <Field label="Tanggal" value={formatDate(row.date)} />
          <Field label="Jalur · Metode" value={`${row.lane} · ${row.method}`} />
          <Field label="Cabang" value={row.branch} />
          <Field label="ID Transaksi" value={row.id} />
          {row.recordedBy && <Field label="Dicatat oleh" value={row.recordedBy} />}
          {row.ratifiedBy && <Field label="Disahkan oleh" value={row.ratifiedBy} />}
        </div>

        {row.note && <Field label="Catatan" value={row.note} />}
        {row.proof && (
          <Field
            label="Bukti Pembayaran"
            value={
              <a className="link" href={`/proofs/${row.proof}`} target="_blank" rel="noreferrer">
                {row.proof}
              </a>
            }
          />
        )}
        {row.rejectReason && (
          <Field
            label="Alasan penolakan"
            value={<span className="text-danger">{row.rejectReason}</span>}
          />
        )}

        {isValid(row) && (
          <Group justify="flex-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                notify.success(`${receiptKind(row)} ${receiptKey(row)} disiapkan untuk dicetak.`)
              }
            >
              Cetak {receiptKind(row)}
            </button>
          </Group>
        )}

        {needsRatification(row) && !canRatify && (
          <span className="caption text-muted">
            Menunggu pengesahan Manajer Finance. Yang menerima uang bukan yang menyetujuinya.
          </span>
        )}

        {needsRatification(row) && canRatify && !rejecting && (
          <Group justify="flex-end">
            <button type="button" className="btn btn-danger" onClick={() => setRejecting(true)}>
              Tolak
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                notify.success(`Pembayaran ${formatMoney(row.amount)} ${row.studentName} disahkan.`)
                onClose()
              }}
            >
              Sahkan
            </button>
          </Group>
        )}

        {needsRatification(row) && canRatify && rejecting && (
          <div className="stack">
            <Textarea
              label="Alasan penolakan"
              description="Dibaca siswa dan Staf Finance. Catatan tidak dihapus, hanya ditandai Ditolak."
              placeholder="Contoh: bukti tidak terbaca, unggah ulang foto yang jelas."
              autosize
              minRows={2}
              value={reason}
              onChange={(event) => setReason(event.currentTarget.value)}
              required
            />
            <Group justify="flex-end">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRejecting(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={reason.trim() === ""}
                onClick={() => {
                  notify.success(
                    `Pembayaran ${row.studentName} ditolak. Catatannya tetap tersimpan.`,
                  )
                  onClose()
                }}
              >
                Tolak Pembayaran
              </button>
            </Group>
          </div>
        )}
      </div>
    </Modal>
  )
}
