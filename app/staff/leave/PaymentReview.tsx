"use client"

import { File01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Group, Modal, Stack } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { formatDateTime } from "@/src/lib/format"
import { formatMoney, idr, shortfall as moneyShortfall } from "@/src/lib/money"

import { Field, Panel } from "./LeavePanels"
import { RejectModal } from "./RejectModal"
import type { StaffLeave } from "./sample"

const MODAL_TITLE = { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 }

function ProofModal({
  leave,
  opened,
  onClose,
}: {
  leave: StaffLeave
  opened: boolean
  onClose: () => void
}) {
  const proof = leave.proof
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Verifikasi Bukti Pembayaran"
      size="lg"
      styles={{ title: MODAL_TITLE }}
    >
      <Stack gap="md">
        <div className="grid-3">
          <Field label="Siswa" value={`${leave.student.name} · ${leave.student.nis}`} />
          <Field label="Nominal" value={proof ? formatMoney(proof.amount) : "-"} />
          <Field label="ID Transaksi" value={proof?.trxId ?? "-"} />
        </div>
        <div
          className="card-soft stack items-center"
          style={{ minHeight: 220, justifyContent: "center", gap: 8 }}
        >
          <HugeiconsIcon icon={File01Icon} size={32} strokeWidth={1.5} className="text-faint" />
          <span className="body-sm text-muted">{proof?.name ?? "Belum ada berkas"}</span>
          <a
            className="btn btn-secondary btn-sm"
            href="#"
            onClick={(event) => event.preventDefault()}
          >
            Buka di tab baru
          </a>
        </div>
        <Group justify="flex-end">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              notifications.show({
                color: "red",
                message: `Bukti ${leave.student.name} ditolak. Siswa diminta mengunggah ulang sebelum batas waktu.`,
              })
              onClose()
            }}
          >
            Tolak Bukti
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              notifications.show({
                message: `Pembayaran ${leave.student.name} diverifikasi. Pengajuan pindah ke Persetujuan Akhir.`,
              })
              onClose()
            }}
          >
            Verifikasi Pembayaran
          </button>
        </Group>
      </Stack>
    </Modal>
  )
}

export function PaymentReview({ leave }: { leave: StaffLeave }) {
  const [dialog, setDialog] = useState<"proof" | "reject" | null>(null)

  const finance = leave.finance
  const due = finance ? moneyShortfall(finance.minimumBeforeLeave, finance.totalPaid) : idr(0)
  const proof = leave.proof

  return (
    <>
      <Panel title="Kelengkapan Pembayaran">
        <div className="grid-2">
          <Field
            label="Status Keuangan"
            value={
              <span className={`badge ${proof ? "badge-berjalan" : "badge-tindakan"}`}>
                {proof ? "Menunggu Verifikasi Pembayaran" : "Menunggu Pembayaran"}
              </span>
            }
          />
          <Field label="Total Kewajiban" value={formatMoney(due)} />
          <Field
            label="Verifikasi Pembayaran"
            value={proof ? "Bukti terkirim, belum diperiksa" : "Belum ada bukti"}
          />
          <Field label="Batas Waktu" value={finance ? formatDateTime(finance.deadline) : "-"} />
        </div>

        <div className="stack" style={{ gap: 4 }}>
          <span className="caption text-muted">Bukti Pembayaran</span>
          {proof ? (
            <div className="row-soft">
              <span className="row body-sm" style={{ gap: 8, minWidth: 0 }}>
                <HugeiconsIcon icon={File01Icon} size={16} strokeWidth={1.5} />
                {proof.name} · {formatMoney(proof.amount)} · {proof.trxId}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDialog("proof")}
              >
                Pratinjau
              </button>
            </div>
          ) : (
            <Notice tone="warning">
              Siswa belum mengunggah bukti. Batas waktu{" "}
              {finance ? formatDateTime(finance.deadline) : "-"}; lewat itu pengajuan gugur.
            </Notice>
          )}
        </div>

        <div className="row row-wrap" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!proof}
            title={proof ? undefined : "Verifikasi terbuka setelah bukti masuk."}
            onClick={() => setDialog("proof")}
          >
            Verifikasi Pembayaran
          </button>
          <button type="button" className="btn btn-danger" onClick={() => setDialog("reject")}>
            Tolak Pengajuan Cuti
          </button>
          {!proof && (
            <span className="caption text-muted">Verifikasi terbuka setelah bukti masuk.</span>
          )}
        </div>
      </Panel>

      <ProofModal leave={leave} opened={dialog === "proof"} onClose={() => setDialog(null)} />
      <RejectModal
        leave={leave}
        stageLabel="Verifikasi Pembayaran"
        opened={dialog === "reject"}
        onClose={() => setDialog(null)}
      />
    </>
  )
}
