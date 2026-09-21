"use client"

import { useState } from "react"
import { FileInput, Stack, Textarea, TextInput } from "@mantine/core"
import { notify } from "@/src/lib/notify"
import { Upload04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { formatFileSize } from "@/src/lib/format"

import { CHANGEABLE_SECTIONS, type ProfileField } from "../profile"

const UPLOAD_MAX_BYTES = 5 * 1024 * 1024
const UPLOAD_RULE = `PDF, PNG, atau JPG. Maksimal ${formatFileSize(UPLOAD_MAX_BYTES)}.`

const INITIAL_VALUES: Readonly<Record<string, string>> = Object.fromEntries(
  CHANGEABLE_SECTIONS.flatMap((section) => section.fields.map((field) => [field.key, field.value])),
)

function isChanged(field: ProfileField, values: Readonly<Record<string, string>>): boolean {
  return (values[field.key] ?? "").trim() !== field.value
}

function changedDescription(field: ProfileField): string {
  return field.needsDocument
    ? `Diubah. Diperiksa ${field.reviewer}, butuh berkas pendukung.`
    : `Diubah. Diperiksa ${field.reviewer}.`
}

export function ChangeRequestForm() {
  const [values, setValues] = useState<Readonly<Record<string, string>>>(INITIAL_VALUES)
  const [reason, setReason] = useState("")
  const [document, setDocument] = useState<File | null>(null)

  const changed = CHANGEABLE_SECTIONS.flatMap((section) =>
    section.fields.filter((field) => isChanged(field, values)),
  )
  const needsDocument = changed.some((field) => field.needsDocument)
  const reviewers = [...new Set(changed.map((field) => field.reviewer))]

  const missing = [
    changed.length === 0 ? "ubah minimal satu data" : null,
    changed.some((field) => !(values[field.key] ?? "").trim()) ? "isi data yang dikosongkan" : null,
    reason.trim() ? null : "tulis alasannya",
    needsDocument && !document ? "unggah berkas pendukung" : null,
  ].filter((item): item is string => item !== null)

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function reset() {
    setValues(INITIAL_VALUES)
    setReason("")
    setDocument(null)
  }

  return (
    <form
      className="stack stack-lg"
      onSubmit={(event) => {
        event.preventDefault()
        notify.success(
          `Pengajuan ${changed.length} perubahan terkirim. ${reviewers.join(" dan ")} memeriksanya, hasilnya tampil di Profil.`,
        )
        reset()
      }}
    >
      {CHANGEABLE_SECTIONS.map((section) => (
        <section key={section.id} className="card stack" aria-labelledby={`${section.id}-heading`}>
          <div className="section-head">
            <h2 className="h5" id={`${section.id}-heading`}>
              {section.title}
            </h2>
          </div>

          <div className="grid-2">
            {section.fields.map((field) => {
              const changedNow = isChanged(field, values)
              return (
                <TextInput
                  key={field.key}
                  label={field.label}
                  placeholder={field.value}
                  description={changedNow ? changedDescription(field) : undefined}
                  value={values[field.key] ?? ""}
                  onChange={(event) => setValue(field.key, event.currentTarget.value)}
                  styles={
                    changedNow ? { description: { color: "var(--color-warning)" } } : undefined
                  }
                />
              )
            })}
          </div>
        </section>
      ))}

      <section className="card stack" aria-labelledby="reason-heading">
        <div className="stack" style={{ gap: 2 }}>
          <h2 className="h5" id="reason-heading">
            Alasan dan Berkas
          </h2>
          <span className="caption text-muted">
            Satu alasan untuk seluruh perubahan di atas. Berkas wajib kalau ada data resmi yang
            diubah: nama, NIK, tanggal lahir, jenis kelamin, atau pendidikan.
          </span>
        </div>

        <Stack gap="md">
          <Textarea
            label="Alasan perubahan"
            description="Singkat saja. Contoh: salah ketik saat mendaftar, pindah alamat."
            placeholder="Tulis alasannya"
            autosize
            minRows={3}
            value={reason}
            onChange={(event) => setReason(event.currentTarget.value)}
          />

          <FileInput
            label="Berkas pendukung"
            description={
              document
                ? `${document.name} · ${formatFileSize(document.size)}`
                : `${needsDocument ? "Wajib untuk perubahan ini, misalnya KTP, akta, atau ijazah." : "Opsional untuk perubahan ini."} ${UPLOAD_RULE}`
            }
            placeholder="Pilih berkas"
            leftSection={<HugeiconsIcon icon={Upload04Icon} size={16} strokeWidth={1.5} />}
            clearable
            accept="application/pdf,image/png,image/jpeg"
            value={document}
            onChange={setDocument}
          />
        </Stack>
      </section>

      <div className="row row-between row-wrap" style={{ gap: 12 }}>
        <span className="caption text-muted" aria-live="polite">
          {missing.length > 0
            ? `Sebelum mengirim: ${missing.join(", ")}.`
            : `${changed.length} data diubah: ${changed.map((field) => field.label.toLowerCase()).join(", ")}. Diperiksa ${reviewers.join(" dan ")}.`}
        </span>
        <div className="row" style={{ gap: 8 }}>
          {changed.length > 0 && (
            <button type="button" className="btn btn-secondary" onClick={reset}>
              Batalkan Perubahan
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={missing.length > 0}>
            Kirim Pengajuan
          </button>
        </div>
      </div>
    </form>
  )
}
