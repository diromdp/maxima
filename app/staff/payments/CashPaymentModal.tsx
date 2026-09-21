"use client"

import { Modal, NumberInput, Select, Textarea, TextInput } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { Dropzone, MIME_TYPES } from "@mantine/dropzone"
import { useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { formatFileSize } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { BRANCHES } from "../classes/sample"
import { STUDENTS } from "../students/sample"
import { CASH_KINDS, type CashKind } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }
const UPLOAD_MAX_BYTES = 5 * 1024 * 1024
const UPLOAD_RULE = `JPG, PNG, atau PDF. Maksimal ${formatFileSize(UPLOAD_MAX_BYTES)}.`

export function CashPaymentModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [nis, setNis] = useState<string | null>(null)
  const [kind, setKind] = useState<CashKind | null>(null)
  const [amount, setAmount] = useState<number | string>("")
  const [proof, setProof] = useState<File | null>(null)

  const missing = [
    nis === null ? "pilih siswa" : null,
    kind === null ? "pilih jenis" : null,
    Number(amount) <= 0 ? "isi nominal" : null,
    proof === null ? "unggah bukti pembayaran" : null,
  ].filter((item): item is string => item !== null)

  const reset = () => {
    setNis(null)
    setKind(null)
    setAmount("")
    setProof(null)
    onClose()
  }

  const student = STUDENTS.find((candidate) => candidate.nis === nis)

  return (
    <Modal
      opened={opened}
      onClose={reset}
      title="Catat Pembayaran Tunai"
      size="lg"
      styles={TITLE_STYLE}
    >
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault()
          notify.success(
            `Pembayaran ${student?.name ?? ""} dicatat, menunggu pengesahan Manajer Finance.`,
          )
          reset()
        }}
      >
        <Select
          label="Siswa"
          placeholder="Cari nama siswa..."
          searchable
          data={STUDENTS.map((candidate) => ({
            value: candidate.nis,
            label: `${candidate.name} · ${candidate.nis}`,
          }))}
          value={nis}
          onChange={setNis}
          required
        />

        <DateInput
          name="date"
          label="Tanggal Pembayaran"
          placeholder="dd/mm/yyyy"
          valueFormat="DD/MM/YYYY"
          defaultValue={new Date()}
          maxDate={new Date()}
          required
        />

        <Select
          label="Jenis"
          placeholder="Rupiah / Euro / Dana Talang"
          description="Rupiah untuk tunai di kasir yang dicatat admin; Bayar Cash dari portal masuk sendiri."
          data={[...CASH_KINDS]}
          value={kind}
          onChange={(value) => setKind(value as CashKind | null)}
          required
        />

        <NumberInput
          name="amount"
          label="Nominal"
          placeholder={kind === "Euro" ? "800" : "10.000.000"}
          prefix={kind === "Euro" ? "€ " : "Rp "}
          thousandSeparator="."
          decimalSeparator=","
          hideControls
          min={0}
          value={amount}
          onChange={setAmount}
          required
        />

        <TextInput name="receiver" label="Penerima" placeholder="Nama penerima" required />

        <Select
          name="branch"
          label="Cabang"
          placeholder="Pilih cabang"
          data={[...BRANCHES]}
          defaultValue={student?.branch}
          required
        />

        <Textarea
          name="note"
          label="Catatan / Keterangan"
          placeholder="Tambahkan catatan atau keterangan pembayaran"
          autosize
          minRows={2}
        />

        <div className="stack" style={{ gap: 6 }}>
          <span className="field-label">Bukti Pembayaran</span>
          {proof ? (
            <div className="row-soft">
              <div className="stack" style={{ gap: 0 }}>
                <span className="body-sm">{proof.name}</span>
                <span className="caption text-muted tabular">{formatFileSize(proof.size)}</span>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProof(null)}>
                Hapus
              </button>
            </div>
          ) : (
            <Dropzone
              onDrop={(files) => setProof(files[0] ?? null)}
              onReject={() => notify.error(`Berkas ditolak. ${UPLOAD_RULE}`)}
              maxSize={UPLOAD_MAX_BYTES}
              maxFiles={1}
              accept={[MIME_TYPES.jpeg, MIME_TYPES.png, MIME_TYPES.pdf]}
            >
              <DropzoneBody rule={UPLOAD_RULE} />
            </Dropzone>
          )}
        </div>

        <span className="caption text-muted" aria-live="polite">
          {missing.length > 0
            ? `Sebelum simpan: ${missing.join(", ")}.`
            : "Berstatus Menunggu sampai Manajer Finance mengesahkannya."}
        </span>

        <button type="submit" className="btn btn-primary btn-block" disabled={missing.length > 0}>
          Simpan Pembayaran
        </button>
      </form>
    </Modal>
  )
}
