"use client"

import { Group, Modal, Select, Stack, Textarea } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { formatDateLong } from "@/src/lib/format"

import { periodLabel } from "../../portal/leave/leave"
import { Field } from "./LeavePanels"
import type { StaffLeave } from "./sample"

const REASONS = [
  "Riwayat pembayaran belum memenuhi syarat",
  "Periode cuti perlu disesuaikan",
  "Dokumen pendukung tidak memadai",
  "Sudah pernah cuti selama masa belajar",
  "Batas waktu pembayaran terlewat",
] as const

export function RejectModal({
  leave,
  stageLabel,
  opened,
  onClose,
}: {
  leave: StaffLeave
  stageLabel: string
  opened: boolean
  onClose: () => void
}) {
  const [reason, setReason] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [retryDate, setRetryDate] = useState<Date | null>(null)

  const missing = [
    reason ? null : "pilih alasan",
    message.trim() ? null : "tulis keterangan untuk siswa",
    retryDate ? null : "tetapkan tanggal paling awal boleh mengajukan ulang",
  ].filter((item): item is string => item !== null)

  function close() {
    onClose()
    setReason(null)
    setMessage("")
    setRetryDate(null)
  }

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Tolak Pengajuan Cuti"
      size="lg"
      styles={{ title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }}
    >
      <Stack gap="md">
        <div className="grid-2">
          <Field label="Siswa" value={`${leave.student.name} · NIS ${leave.student.nis}`} />
          <Field label="Periode" value={periodLabel(leave)} />
        </div>
        <Field label="Ditolak pada tahap" value={stageLabel} />

        <Select
          label="Alasan penolakan"
          placeholder="Pilih alasan"
          data={[...REASONS]}
          value={reason}
          onChange={setReason}
        />
        <DatesProvider settings={{ locale: "id" }}>
          <DateInput
            label="Boleh mengajukan ulang mulai"
            description="Wajib. Penolakan harus menyebut jalan keluarnya."
            placeholder="Pilih tanggal"
            valueFormat="DD MMM YYYY"
            minDate={new Date()}
            value={retryDate}
            onChange={(value) => setRetryDate(value ? new Date(value) : null)}
          />
        </DatesProvider>
        <Textarea
          label="Keterangan untuk siswa"
          description="Dibaca siswa apa adanya di portal. Sebut apa yang harus ia lakukan."
          placeholder="Contoh: Lunasi tiga angsuran tertunggak, lalu ajukan kembali."
          autosize
          minRows={3}
          value={message}
          onChange={(event) => setMessage(event.currentTarget.value)}
        />

        {retryDate && (
          <Notice tone="warning" title="Yang dibaca siswa">
            {reason ?? "..."}. {message || "..."} Pengajuan ulang bisa dilakukan mulai{" "}
            {formatDateLong(retryDate)}.
          </Notice>
        )}

        <Group justify="space-between" wrap="wrap">
          <span className="caption text-muted">
            {missing.length > 0
              ? `Sebelum menolak: ${missing.join(", ")}.`
              : "Tercatat di Log Aktivitas."}
          </span>
          <Group>
            <button type="button" className="btn btn-secondary" onClick={close}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={missing.length > 0}
              onClick={() => {
                notifications.show({
                  color: "red",
                  message: `Pengajuan ${leave.student.name} ditolak. Siswa diberi tahu di portal.`,
                })
                close()
              }}
            >
              Konfirmasi Penolakan
            </button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  )
}
