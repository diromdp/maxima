"use client"

import { Group, Modal, NumberInput, Stack, Textarea } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { formatMoney, idr, shortfall as moneyShortfall } from "@/src/lib/money"

import { Field, Panel } from "./LeavePanels"
import { RejectModal } from "./RejectModal"
import type { StaffLeave } from "./sample"

const MODAL_TITLE = { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 }

type Dialog = "obligation" | "sufficient" | "reject" | null

function assessment(leave: StaffLeave) {
  const totalPaid = leave.finance?.totalPaid ?? idr(0)
  const minimum = leave.finance?.minimumBeforeLeave ?? idr(0)
  return { totalPaid, minimum, due: moneyShortfall(minimum, totalPaid) }
}

function ObligationModal({
  leave,
  opened,
  onClose,
  note,
}: {
  leave: StaffLeave
  opened: boolean
  onClose: () => void
  note: string
}) {
  const { totalPaid, minimum, due } = assessment(leave)
  const [amount, setAmount] = useState<number | string>(due.amount)
  const [deadline, setDeadline] = useState<Date | null>(null)

  const missing = [
    Number(amount) > 0 ? null : "isi nominal",
    deadline ? null : "tetapkan batas pembayaran",
    note.trim() ? null : "tulis catatan Finance",
  ].filter((item): item is string => item !== null)

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Tetapkan Kewajiban Pembayaran"
      size="lg"
      styles={{ title: MODAL_TITLE }}
    >
      <Stack gap="md">
        <span className="body-sm text-muted">
          Kirim kewajiban ke siswa. Pengajuan pindah ke tahap 3, siswa melihat nominal dan batas
          waktunya di portal, lalu membayar lewat halaman Pembayaran.
        </span>
        <div className="grid-3">
          <Field label="Siswa" value={`${leave.student.name} · ${leave.student.nis}`} />
          <Field label="Total Pembayaran" value={formatMoney(totalPaid)} />
          <Field label="Cicilan Minimum" value={formatMoney(minimum)} />
        </div>
        <div className="grid-2">
          <NumberInput
            label="Kekurangan yang ditagih"
            description={`Selisih terhitung ${formatMoney(due)}.`}
            prefix="Rp "
            thousandSeparator="."
            decimalSeparator=","
            hideControls
            min={0}
            value={amount}
            onChange={setAmount}
          />
          <DatesProvider settings={{ locale: "id" }}>
            <DateInput
              label="Batas Pembayaran"
              description="Lewat batas ini pengajuan gugur, siswa mengajukan ulang."
              placeholder="Pilih tanggal"
              valueFormat="DD MMM YYYY"
              minDate={new Date()}
              value={deadline}
              onChange={(value) => setDeadline(value ? new Date(value) : null)}
            />
          </DatesProvider>
        </div>
        <Field label="Catatan Finance" value={note || "-"} />
        <Group justify="space-between" wrap="wrap">
          <span className="caption text-muted">
            {missing.length > 0
              ? `Sebelum kirim: ${missing.join(", ")}.`
              : "Siswa langsung diberi tahu."}
          </span>
          <Group>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={missing.length > 0}
              onClick={() => {
                notifications.show({
                  message: `Kewajiban ${formatMoney(idr(Number(amount)))} dikirim ke ${leave.student.name}. Pengajuan pindah ke Pembayaran Ditetapkan.`,
                })
                onClose()
              }}
            >
              Konfirmasi & Kirim
            </button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  )
}

function SufficientModal({
  leave,
  opened,
  onClose,
}: {
  leave: StaffLeave
  opened: boolean
  onClose: () => void
}) {
  const { totalPaid, minimum, due } = assessment(leave)
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Pembayaran Sudah Mencukupi"
      size="md"
      styles={{ title: MODAL_TITLE }}
    >
      <Stack gap="md">
        <div className="grid-3">
          <Field label="Siswa" value={leave.student.name} />
          <Field label="Total Pembayaran" value={formatMoney(totalPaid)} />
          <Field label="Cicilan Minimum" value={formatMoney(minimum)} />
        </div>
        <Notice tone={due.amount === 0 ? "success" : "warning"}>
          {due.amount === 0
            ? "Siswa tidak perlu menyetor tambahan. Pengajuan melompati tahap pembayaran dan diteruskan ke Persetujuan Akhir."
            : `Selisih terhitung masih ${formatMoney(due)}. Meneruskan berarti Finance menanggung selisihnya sebagai kebijakan.`}
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
                message: `${leave.student.name} diteruskan ke Persetujuan Akhir tanpa tagihan tambahan.`,
              })
              onClose()
            }}
          >
            Setujui Verifikasi Finance
          </button>
        </Group>
      </Stack>
    </Modal>
  )
}

export function FinanceReview({ leave }: { leave: StaffLeave }) {
  const [dialog, setDialog] = useState<Dialog>(null)
  const [note, setNote] = useState(leave.financeNote ?? "")
  const { totalPaid, minimum, due } = assessment(leave)

  return (
    <>
      <Panel title="Penilaian Pembayaran">
        <div className="grid-3">
          <Field label="Total Pembayaran" value={formatMoney(totalPaid)} />
          <Field label="Cicilan Minimum sebelum cuti" value={formatMoney(minimum)} />
          <div className="stack" style={{ gap: 2 }}>
            <span className="caption text-muted">Selisih / Kekurangan</span>
            <span className={`h5 tabular${due.amount > 0 ? " text-danger" : " text-success"}`}>
              {due.amount > 0 ? formatMoney(due) : "Mencukupi"}
            </span>
          </div>
        </div>
        <Textarea
          label="Catatan Finance"
          description="Ikut terkirim ke siswa bersama kewajibannya. Cara membayar sudah ada di halaman Pembayaran, tulis di sini hanya yang khusus untuk pengajuan ini."
          placeholder="Contoh: pembayaran belum mencapai cicilan minimum sebelum cuti."
          autosize
          minRows={3}
          value={note}
          onChange={(event) => setNote(event.currentTarget.value)}
        />
        <div className="row row-wrap" style={{ gap: 8 }}>
          <button type="button" className="btn btn-primary" onClick={() => setDialog("obligation")}>
            Tetapkan Kewajiban Pembayaran
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDialog("sufficient")}
          >
            Pembayaran Sudah Mencukupi
          </button>
          <button type="button" className="btn btn-danger" onClick={() => setDialog("reject")}>
            Tolak
          </button>
        </div>
        <span className="caption text-muted">
          Kekurangan lebih dari nol: tetapkan kewajiban. Sudah cukup: teruskan ke Persetujuan Akhir.
        </span>
      </Panel>

      <ObligationModal
        leave={leave}
        note={note}
        opened={dialog === "obligation"}
        onClose={() => setDialog(null)}
      />
      <SufficientModal
        leave={leave}
        opened={dialog === "sufficient"}
        onClose={() => setDialog(null)}
      />
      <RejectModal
        leave={leave}
        stageLabel="Verifikasi Finance"
        opened={dialog === "reject"}
        onClose={() => setDialog(null)}
      />
    </>
  )
}
