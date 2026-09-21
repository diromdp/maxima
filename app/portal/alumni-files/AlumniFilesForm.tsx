"use client"

import { useState } from "react"
import { Group, Text, TextInput, Title } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { Dropzone } from "@mantine/dropzone"
import { useForm } from "@mantine/form"
import { useLocalStorage } from "@mantine/hooks"
import { notify } from "@/src/lib/notify"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon } from "@hugeicons/core-free-icons"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { formatFileSize } from "@/src/lib/format"
import { Notice } from "@/src/components/ui/Notice"

import { DepartureChecklist } from "../admin-progress/DepartureChecklist"
import { DOCUMENT_GROUPS } from "../documents/documents"
import {
  DRAFT_KEY,
  EMPTY_FORM,
  PROFILE,
  UPLOAD_MAX_BYTES,
  UPLOAD_MIME,
  type ContractVisa,
} from "./data"

const BADGE: Readonly<Record<string, string>> = {
  Terverifikasi: "badge-beres",
  Selesai: "badge-beres",
  Menunggu: "badge-berjalan",
  Diproses: "badge-berjalan",
  "Belum diunggah": "badge-tindakan",
  Ditolak: "badge-tindakan",
}

const BETRIEB = DOCUMENT_GROUPS.find((g) => g.id === "dari-betrieb")

function DateField({
  form,
  name,
  label,
  description,
}: {
  form: ReturnType<typeof useForm<ContractVisa>>
  name: keyof ContractVisa
  label: string
  description?: string
}) {
  const value = form.values[name]
  return (
    <DateInput
      label={label}
      description={description}
      placeholder="Pilih tanggal"
      valueFormat="DD MMM YYYY"
      clearable
      leftSection={<HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={1.5} />}
      value={value ? new Date(value as string) : null}
      onChange={(d) => form.setFieldValue(name, d ? new Date(d).toISOString() : null)}
    />
  )
}

function FieldGroup({
  legend,
  hint,
  children,
}: {
  legend: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="stack m-0 min-w-0 border-0 p-0">
      <legend className="stack mb-4 p-0" style={{ gap: 2 }}>
        <span className="h6">{legend}</span>
        <span className="caption text-muted">{hint}</span>
      </legend>
      <div className="grid-3">{children}</div>
    </fieldset>
  )
}

const UPLOAD_RULE = "PDF, JPG, atau PNG. Maksimal 10 MB per berkas."

function rejectUpload() {
  notify.error(`Berkas ditolak. ${UPLOAD_RULE}`)
}

function FileDrop({
  label,
  hint,
  files,
  multiple = false,
  onAdd,
  onRemove,
}: {
  label: string
  hint: string
  files: readonly File[]
  multiple?: boolean
  onAdd: (files: File[]) => void
  onRemove: (index: number) => void
}) {
  const showDropzone = multiple || files.length === 0

  return (
    <div className="stack stack-sm">
      <div className="stack" style={{ gap: 2 }}>
        <span className="field-label">{label}</span>
        <span className="caption text-muted">{hint}</span>
      </div>

      {files.length > 0 && (
        <div className="list-rows">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="row row-between">
              <div className="stack" style={{ gap: 0 }}>
                <span className="body-sm">{file.name}</span>
                <span className="caption text-muted tabular">{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onRemove(index)}
                aria-label={`Hapus ${file.name}`}
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}

      {showDropzone && (
        <Dropzone
          onDrop={onAdd}
          onReject={rejectUpload}
          maxSize={UPLOAD_MAX_BYTES}
          maxFiles={multiple ? undefined : 1}
          multiple={multiple}
          accept={[...UPLOAD_MIME]}
        >
          <DropzoneBody
            prompt={multiple && files.length > 0 ? "Tambah berkas lagi" : undefined}
            rule={UPLOAD_RULE}
          />
        </Dropzone>
      )}
    </div>
  )
}

export function AlumniFilesForm() {
  const [draft, setDraft] = useLocalStorage<ContractVisa>({
    key: DRAFT_KEY,
    defaultValue: EMPTY_FORM,
    getInitialValueInEffect: true,
  })
  const form = useForm<ContractVisa>({ initialValues: draft })
  const [visa, setVisa] = useState<File | null>(null)
  const [others, setOthers] = useState<File[]>([])

  function saveDraft() {
    setDraft(form.values)
    notify.info("Draf tersimpan di peramban ini.")
  }

  return (
    <form
      className="stack stack-lg"
      onSubmit={form.onSubmit(() => {
        if (!visa) {
          notify.error("Unggah visa dulu. Berkas itu wajib.")
          return
        }
        setDraft(form.values)
        notify.success("Pemberkasan terkirim. Admission memverifikasi tanggal dan berkas Anda.")
      })}
    >
      <Notice tone="info">
        Seluruh isian di halaman ini berstatus usulan sampai Admission memverifikasinya. Status
        Alumni menyala dari tanggal keberangkatan versi Admission, bukan yang Anda ketik.
      </Notice>
      <section className="card stack" aria-labelledby="profile-heading">
        <Title order={5} id="profile-heading">
          Data Diri & Program
        </Title>

        <dl className="grid-4" style={{ margin: 0 }}>
          {(
            [
              ["Nama Lengkap", PROFILE.fullName],
              ["Email", PROFILE.email],
              ["Panggilan", PROFILE.salutation],
              ["Cabang · Program", `${PROFILE.branch} · ${PROFILE.program}`],
            ] as const
          ).map(([name, value]) => (
            <div key={name} className="stack" style={{ gap: 2 }}>
              <dt className="spec-name">{name}</dt>
              <dd className="body-sm" style={{ margin: 0 }}>
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <TextInput
          label="Jurusan Program"
          description="Isi persis seperti yang tertulis di kontrak (Ausbildung / Fachkraft)."
          placeholder="Contoh: Kaufmann/Kauffrau für Spedition und Logistikdienstleistung"
          {...form.getInputProps("major")}
        />
      </section>
      <section className="card stack stack-lg" aria-labelledby="contract-heading">
        <div className="stack" style={{ gap: 2 }}>
          <Title order={5} id="contract-heading">
            Tanggal & Detail Kontrak / Visa
          </Title>
          <Text size="sm" c="dimmed">
            Salin dari Vertrag dan visa Anda. Kosongkan yang belum ada, halaman ini bisa diperbarui
            sampai Anda berangkat.
          </Text>
        </div>

        <DatesProvider settings={{ locale: "id" }}>
          <FieldGroup legend="Kontrak" hint="Tempat dan masa kerja seperti tertulis di Vertrag.">
            <TextInput
              label="Perusahaan"
              placeholder="Contoh: Borussia Dortmund GmbH"
              {...form.getInputProps("company")}
            />
            <TextInput
              label="Kota, Bundesland"
              placeholder="Contoh: München, Bayern"
              {...form.getInputProps("cityState")}
            />
            <TextInput
              label="Sekolah"
              placeholder="Nama Berufsschule"
              {...form.getInputProps("school")}
            />
            <DateField form={form} name="contractStart" label="Tanggal Dimulai Kontrak" />
            <DateField form={form} name="contractEnd" label="Tanggal Selesai Kontrak" />
          </FieldGroup>

          <FieldGroup
            legend="Visa dan keberangkatan"
            hint="Isi urut sesuai tahap yang sudah terjadi."
          >
            <DateField form={form} name="visaApplied" label="Tanggal Pengajuan Visa" />
            <DateField form={form} name="visaInterview" label="Tanggal Wawancara Visa" />
            <DateField form={form} name="visaIssued" label="Tanggal Visa Terbit" />
            <TextInput
              label="Masa Berlaku Visa"
              placeholder="Contoh: 12 bulan"
              {...form.getInputProps("visaValidity")}
            />
            <DateField
              form={form}
              name="departureDate"
              label="Tanggal Keberangkatan"
              description="Setelah diverifikasi Admission, tanggal ini yang menyalakan status Alumni."
            />
          </FieldGroup>
        </DatesProvider>
      </section>

      <div className="grid-2">
        <DepartureChecklist title="Persiapan Keberangkatan" />
        <section className="card stack stack-lg" aria-labelledby="upload-heading">
          <div className="stack" style={{ gap: 2 }}>
            <Title order={5} id="upload-heading">
              Unggah Dokumen
            </Title>
            <Text size="sm" c="dimmed">
              Berkas asli yang dipindai, bukan tautan Drive. Admission memverifikasi setiap berkas.
            </Text>
          </div>

          <FileDrop
            label="Visa"
            hint="Wajib. Halaman visa yang tertempel di paspor."
            files={visa ? [visa] : []}
            onAdd={(files) => setVisa(files[0] ?? null)}
            onRemove={() => setVisa(null)}
          />

          <FileDrop
            label="Dokumen Lainnya"
            hint="Opsional. Bisa beberapa berkas sekaligus."
            files={others}
            multiple
            onAdd={(files) => setOthers((current) => [...current, ...files])}
            onRemove={(index) => setOthers((current) => current.filter((_, i) => i !== index))}
          />

          {BETRIEB && (
            <div className="stack stack-sm">
              <Group justify="space-between" align="baseline" wrap="nowrap">
                <div className="stack" style={{ gap: 2 }}>
                  <span className="h6">Berkas dari Betrieb</span>
                  <span className="caption text-muted">
                    Diunggah di Dokumen Saya, tidak diminta lagi di sini.
                  </span>
                </div>
                <Link className="link" href="/portal/documents#dari-betrieb">
                  Kelola di Dokumen Saya
                </Link>
              </Group>
              <div className="list-rows">
                {BETRIEB.files.map((b) => (
                  <div key={b.name} className="row row-between">
                    <span className="body-sm">{b.name}</span>
                    <span className={`badge ${BADGE[b.status]}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <Group justify="flex-end" gap="sm">
        <button type="button" className="btn btn-secondary" onClick={saveDraft}>
          Simpan Draf
        </button>
        <button type="submit" className="btn btn-primary">
          Kirim Pemberkasan
        </button>
      </Group>
    </form>
  )
}
