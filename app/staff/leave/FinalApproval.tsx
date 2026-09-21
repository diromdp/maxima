"use client"

import { Group, Modal, Stack } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { formatDateLong, formatDateTime } from "@/src/lib/format"
import { formatMoney, idr, shortfall as moneyShortfall } from "@/src/lib/money"

import { durationLabel, periodLabel } from "../../portal/leave/leave"
import { Field, Panel } from "./LeavePanels"
import { RejectModal } from "./RejectModal"
import type { StaffLeave } from "./sample"

const MODAL_TITLE = { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 }

function ApproveModal({
  leave,
  opened,
  onClose,
}: {
  leave: StaffLeave
  opened: boolean
  onClose: () => void
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Setujui Cuti"
      size="md"
      styles={{ title: MODAL_TITLE }}
    >
      <Stack gap="md">
        <div className="grid-2">
          <Field label="Periode" value={periodLabel(leave)} />
          <Field label="Durasi" value={durationLabel(leave)} />
          <Field label="Posisi kelas saat cuti" value={leave.position} />
          <Field
            label="Rencana kembali"
            value={leave.returnDate ? formatDateLong(leave.returnDate) : "Belum ditetapkan"}
          />
        </div>
        <Notice tone="success">
          Status {leave.student.name} berubah menjadi Cuti. Ia keluar dari anggota kelas, absensi
          dan tagihan berhenti, akun portal tetap terbuka tanpa aksi. Pembayaran yang masuk tetap
          membuka gerbang layanan.
        </Notice>
        <Group justify="flex-end">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              notifications.show({
                message: `Cuti ${leave.student.name} disetujui. Tercatat di Log Aktivitas dan Riwayat Cuti siswa.`,
              })
              onClose()
            }}
          >
            Konfirmasi Persetujuan
          </button>
        </Group>
      </Stack>
    </Modal>
  )
}

export function FinalApproval({ leave }: { leave: StaffLeave }) {
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null)

  const finance = leave.finance
  const obligation = finance
    ? moneyShortfall(finance.minimumBeforeLeave, finance.totalPaid)
    : idr(0)

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
          <Field
            label="Total Kewajiban"
            value={obligation.amount > 0 ? formatMoney(obligation) : "Tidak ada tagihan tambahan"}
          />
          <Field label="Verifikasi oleh" value={leave.financeVerifier ?? "-"} />
          <Field
            label="Diverifikasi pada"
            value={leave.verifiedAt ? formatDateTime(leave.verifiedAt) : "-"}
          />
        </div>
        <div className="row row-wrap" style={{ gap: 8 }}>
          <button type="button" className="btn btn-primary" onClick={() => setDialog("approve")}>
            Setujui Cuti
          </button>
          <button type="button" className="btn btn-danger" onClick={() => setDialog("reject")}>
            Tolak Pengajuan Cuti
          </button>
        </div>
      </Panel>

      <ApproveModal leave={leave} opened={dialog === "approve"} onClose={() => setDialog(null)} />
      <RejectModal
        leave={leave}
        stageLabel="Persetujuan Akhir"
        opened={dialog === "reject"}
        onClose={() => setDialog(null)}
      />
    </>
  )
}
