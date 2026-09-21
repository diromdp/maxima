"use client"

import { useState } from "react"
import { Checkbox, FileInput, Stack, Textarea } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { notify } from "@/src/lib/notify"
import { Calendar03Icon, Upload04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import dayjs from "dayjs"

import { formatDateLong, formatFileSize } from "@/src/lib/format"

import { CardHeader } from "./CardHeader"
import { DRAFT, MAX_MONTHS, monthsBetween, STUDENT, TERMS } from "./leave"

const UPLOAD_MAX_BYTES = 5 * 1024 * 1024
const UPLOAD_RULE = `PDF, PNG, atau JPG. Maksimal ${formatFileSize(UPLOAD_MAX_BYTES)}.`
const EARLIEST_START = dayjs().add(1, "month").startOf("day").toDate()

function toIsoDate(value: unknown): string | null {
  if (!value) return null
  const date = new Date(value as string)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function calendarIcon() {
  return <HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={1.5} />
}

export function LeaveForm() {
  const [start, setStart] = useState<string | null>(DRAFT.start)
  const [end, setEnd] = useState<string | null>(DRAFT.end)
  const [reason, setReason] = useState<string>(DRAFT.reason)
  const [supportDocument, setSupportDocument] = useState<File | null>(null)
  const [agreed, setAgreed] = useState<string[]>([])

  const months = start && end ? monthsBetween(start, end) : null
  const durationValid = months !== null && months > 0 && months <= MAX_MONTHS
  const durationError =
    months === null || durationValid
      ? null
      : months <= 0
        ? "Tanggal masuk kembali harus setelah tanggal mulai cuti."
        : `Durasi cuti maksimal ${MAX_MONTHS} bulan.`

  const missing = [
    durationValid ? null : "lengkapi tanggal cuti",
    reason.trim() ? null : "isi alasan cuti",
    supportDocument ? null : "unggah dokumen pendukung",
    agreed.length === TERMS.length ? null : "centang seluruh ketentuan",
  ].filter((item): item is string => item !== null)

  return (
    <form
      className="stack stack-lg"
      onSubmit={(event) => {
        event.preventDefault()
        notify.success("Pengajuan cuti terkirim. Finance memverifikasinya lebih dulu.")
      }}
    >
      <section className="card stack">
        <CardHeader title="Formulir Pengajuan" note="wajib lengkap sebelum dikirim" />

        <dl className="grid-3" style={{ margin: 0 }}>
          {(
            [
              ["Nama Lengkap", STUDENT.name],
              ["Kelas Saat Ini", STUDENT.className],
              ["Level dan Kapitel Terakhir", STUDENT.position],
            ] as const
          ).map(([name, value]) => (
            <div key={name} className="stack" style={{ gap: 2 }}>
              <dt className="spec-name">{name}</dt>
              <dd className="body-sm" style={{ margin: 0, fontWeight: 600 }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <Stack gap="md">
          <DatesProvider settings={{ locale: "id" }}>
            <div className="grid-2">
              <DateInput
                label="Tanggal Mulai Cuti"
                description={`Paling cepat ${formatDateLong(EARLIEST_START)}, satu bulan dari hari ini.`}
                placeholder="Pilih tanggal"
                valueFormat="DD MMM YYYY"
                minDate={EARLIEST_START}
                clearable
                leftSection={calendarIcon()}
                value={start ? new Date(start) : null}
                onChange={(value) => setStart(toIsoDate(value))}
              />
              <DateInput
                label="Tanggal Rencana Masuk Kembali"
                description={`Paling lama ${MAX_MONTHS} bulan setelah tanggal mulai.`}
                placeholder="Pilih tanggal"
                valueFormat="DD MMM YYYY"
                minDate={start ? new Date(start) : EARLIEST_START}
                clearable
                leftSection={calendarIcon()}
                value={end ? new Date(end) : null}
                onChange={(value) => setEnd(toIsoDate(value))}
                error={durationError}
              />
            </div>
          </DatesProvider>

          <div className="row-soft">
            <span className="spec-name">Masa Cuti</span>
            <span
              className={`body-sm${durationValid ? "" : " text-muted"}`}
              style={{ fontWeight: 600 }}
            >
              {durationValid ? `${months} bulan` : "Belum dapat dihitung"}
            </span>
          </div>

          <Textarea
            label="Alasan Cuti"
            description="Tulis singkat dan jelas. Finance membacanya saat memverifikasi."
            placeholder="Contoh: mendampingi orang tua yang sedang dirawat di luar kota"
            autosize
            minRows={4}
            value={reason}
            onChange={(event) => setReason(event.currentTarget.value)}
          />

          <FileInput
            label="Dokumen Pendukung"
            description={
              supportDocument
                ? `${supportDocument.name} · ${formatFileSize(supportDocument.size)}`
                : `Surat keterangan yang menguatkan alasan Anda. ${UPLOAD_RULE}`
            }
            placeholder="Pilih berkas"
            leftSection={<HugeiconsIcon icon={Upload04Icon} size={16} strokeWidth={1.5} />}
            clearable
            accept="application/pdf,image/png,image/jpeg"
            value={supportDocument}
            onChange={setSupportDocument}
          />
        </Stack>
      </section>

      <section className="card stack">
        <CardHeader
          title="Ketentuan"
          note={`${agreed.length} dari ${TERMS.length} dicentang, wajib semua`}
        />

        <Checkbox.Group value={agreed} onChange={setAgreed}>
          <div className="list-rows">
            {TERMS.map((term) => (
              <Checkbox key={term} value={term} label={term} />
            ))}
          </div>
        </Checkbox.Group>
      </section>

      <div className="row row-between row-wrap" style={{ gap: 12 }}>
        <span className="caption text-muted" aria-live="polite">
          {missing.length > 0
            ? `Sebelum mengirim: ${missing.join(", ")}.`
            : "Semua lengkap. Pengajuan masuk ke Finance begitu dikirim."}
        </span>
        <button type="submit" className="btn btn-primary" disabled={missing.length > 0}>
          Kirim Pengajuan
        </button>
      </div>
    </form>
  )
}
