"use client"

import { Modal, Select, TextInput } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"

import { Notice } from "@/src/components/ui/Notice"
import { savePlacement, saveVisa } from "@/src/entities/placement/actions"
import {
  formOf,
  inputOf,
  PLACEMENT_FIELDS,
  type PlacementDetail,
  type PlacementField,
  type PlacementForm,
  placementFormSchema,
  VISA_FIELDS,
  VISA_KINDS,
  type VisaField,
  type VisaForm,
  visaFormSchema,
} from "@/src/entities/placement/schema"
import { formatDate } from "@/src/lib/format"
import { useActionForm } from "@/src/lib/use-action-form"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export type EditSection = "visa" | "placement"

function proposalHintOf(detail: PlacementDetail) {
  return (field: VisaField | PlacementField): string | undefined => {
    const value = detail.proposals[field]?.value
    if (!value) return undefined
    return `Usulan siswa: ${ISO_DATE.test(value) ? formatDate(value) : value}`
  }
}

function FormActions({ isPending, onClose }: { isPending: boolean; onClose: () => void }) {
  return (
    <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
      <button type="button" className="btn btn-secondary" onClick={onClose}>
        Batal
      </button>
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  )
}

function DateField({
  label,
  value,
  error,
  description,
  isClearable = true,
  onChange,
}: {
  label: string
  value: string
  error: React.ReactNode
  description?: string
  isClearable?: boolean
  onChange: (value: string) => void
}) {
  return (
    <DateInput
      label={label}
      description={description}
      valueFormat="DD MMM YYYY"
      clearable={isClearable}
      value={value || null}
      error={error}
      onChange={(next) => onChange(next ?? "")}
    />
  )
}

function VisaFields({ detail, onClose }: { detail: PlacementDetail; onClose: () => void }) {
  const hint = proposalHintOf(detail)
  const form = useForm<VisaForm>({
    initialValues: formOf(detail.values, VISA_FIELDS),
    validate: schemaResolver(visaFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => saveVisa(detail.student.nis, inputOf(values)),
    successMessage: "Proses visa tersimpan.",
    invalidates: [["visa-placements"]],
    onSuccess: onClose,
  })
  const kinds = [
    ...VISA_KINDS,
    ...(form.values.visaKind && !VISA_KINDS.some((kind) => kind === form.values.visaKind)
      ? [form.values.visaKind]
      : []),
  ]
  const dateProps = (field: "visaAppliedOn" | "visaInterviewOn" | "visaIssuedOn") => ({
    value: form.values[field],
    error: form.errors[field],
    description: hint(field),
    onChange: (value: string) => form.setFieldValue(field, value),
  })

  return (
    <form className="stack stack-lg" onSubmit={submit} noValidate>
      <EditNotice />
      {formError && <Notice tone="danger">{formError}</Notice>}
      <div className="grid-2">
        <DateField label="Tanggal Pengajuan Visa" {...dateProps("visaAppliedOn")} />
        <DateField label="Tanggal Wawancara Kedutaan" {...dateProps("visaInterviewOn")} />
      </div>
      <div className="grid-2">
        <DateField label="Tanggal Visa Terbit" {...dateProps("visaIssuedOn")} />
        <TextInput
          label="Masa Berlaku Visa"
          placeholder="1 Tahun"
          description={hint("visaValidity")}
          {...form.getInputProps("visaValidity")}
        />
      </div>
      <Select
        label="Jenis Visa"
        placeholder="Pilih jenis visa"
        data={kinds}
        clearable
        value={form.values.visaKind || null}
        error={form.errors.visaKind}
        onChange={(value) => form.setFieldValue("visaKind", value ?? "")}
      />
      <FormActions isPending={isPending} onClose={onClose} />
    </form>
  )
}

function PlacementFields({ detail, onClose }: { detail: PlacementDetail; onClose: () => void }) {
  const hint = proposalHintOf(detail)
  const hasDeparted = detail.values.departureOn !== null
  const form = useForm<PlacementForm>({
    initialValues: formOf(detail.values, PLACEMENT_FIELDS),
    validate: schemaResolver(placementFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => savePlacement(detail.student.nis, inputOf(values)),
    successMessage: "Data penempatan tersimpan.",
    invalidates: [["visa-placements"]],
    onSuccess: onClose,
  })
  const text = (field: "company" | "school" | "fieldOfStudy" | "city" | "state") => ({
    description: hint(field),
    ...form.getInputProps(field),
  })
  const date = (field: "contractStartsOn" | "contractEndsOn" | "departureOn") => ({
    value: form.values[field],
    error: form.errors[field],
    onChange: (value: string) => form.setFieldValue(field, value),
  })

  return (
    <form className="stack stack-lg" onSubmit={submit} noValidate>
      <EditNotice />
      {formError && <Notice tone="danger">{formError}</Notice>}
      <div className="grid-2">
        <TextInput label="Perusahaan / Betrieb" {...text("company")} />
        <TextInput label="Sekolah (Berufsschule)" {...text("school")} />
      </div>
      <TextInput label="Jurusan Ausbildung" {...text("fieldOfStudy")} />
      <div className="grid-2">
        <TextInput label="Kota" {...text("city")} />
        <TextInput label="Bundesland" {...text("state")} />
      </div>
      <div className="grid-2">
        <DateField
          label="Tanggal Mulai Kontrak"
          description={hint("contractStartsOn")}
          {...date("contractStartsOn")}
        />
        <DateField
          label="Tanggal Selesai Kontrak"
          description={hint("contractEndsOn")}
          {...date("contractEndsOn")}
        />
      </div>
      <DateField
        label="Tanggal Keberangkatan"
        description={
          hint("departureOn") ??
          (hasDeparted
            ? "Status Alumni sudah menyala; tanggalnya boleh diganti, tidak dapat dikosongkan."
            : "Mengisi tanggal ini menyalakan status Alumni secara otomatis.")
        }
        isClearable={!hasDeparted}
        {...date("departureOn")}
      />
      {!hasDeparted && form.values.departureOn && (
        <Notice tone="warning">
          Menyimpan tanggal keberangkatan mengubah status {detail.student.name} menjadi Alumni di
          seluruh sistem, termasuk halaman Siswa dan portal.
        </Notice>
      )}
      <FormActions isPending={isPending} onClose={onClose} />
    </form>
  )
}

function EditNotice() {
  return (
    <Notice tone="info">
      Yang tersimpan di sini adalah versi yang berlaku dan tercetak. Isian siswa dari portal hanya
      usulan; kalau ada, ia ditulis di bawah kolom sebagai pembanding. Menyimpan menutup usulan
      siswa untuk panel ini.
    </Notice>
  )
}

export function AlumniEditModal({
  detail,
  section,
  onClose,
}: {
  detail: PlacementDetail
  section: EditSection
  onClose: () => void
}) {
  return (
    <Modal
      opened
      onClose={onClose}
      title={section === "visa" ? "Ubah Proses Visa" : "Ubah Data Penempatan"}
      size="lg"
      styles={TITLE_STYLE}
    >
      <DatesProvider settings={{ locale: "id" }}>
        {section === "visa" ? (
          <VisaFields detail={detail} onClose={onClose} />
        ) : (
          <PlacementFields detail={detail} onClose={onClose} />
        )}
      </DatesProvider>
    </Modal>
  )
}
