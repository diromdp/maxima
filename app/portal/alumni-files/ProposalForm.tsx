"use client"

import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Group, Text, TextInput, Title } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"
import { useQueryClient } from "@tanstack/react-query"

import { Notice } from "@/src/components/ui/Notice"
import {
  PROPOSAL_FIELDS,
  type ProposalField,
  type ProposalForm as ProposalValues,
  proposalFormSchema,
} from "@/src/entities/placement/schema"
import { proposePlacement } from "@/src/entities/portal/actions"
import { ownPlacementQuery } from "@/src/entities/portal/queries"
import type { OwnPlacement } from "@/src/entities/portal/schema"
import { DASH, formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"
import { useActionForm } from "@/src/lib/use-action-form"

type DateFieldName =
  | "departureOn"
  | "contractStartsOn"
  | "contractEndsOn"
  | "visaAppliedOn"
  | "visaInterviewOn"
  | "visaIssuedOn"

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const ON_LEAVE = "Pengusulan data dibuka lagi setelah masa cuti Anda selesai."
const DEPARTED =
  "Anda sudah tercatat berangkat, jadi data keberangkatan tidak dapat diusulkan lagi. Hubungi Admission bila ada yang keliru."

const displayOf = (value: string) => (ISO_DATE.test(value) ? formatDate(value) : value)

function baselineOf(placement: OwnPlacement): ProposalValues {
  return Object.fromEntries(
    PROPOSAL_FIELDS.map((field) => [
      field,
      placement.proposals[field]?.value ?? placement.values[field] ?? "",
    ]),
  ) as ProposalValues
}

function changesOf(
  values: ProposalValues,
  baseline: ProposalValues,
): Partial<Record<ProposalField, string>> {
  return Object.fromEntries(
    PROPOSAL_FIELDS.flatMap((field) => {
      const value = values[field].trim()
      return value && value !== baseline[field] ? [[field, value]] : []
    }),
  )
}

function hintOf(placement: OwnPlacement, field: ProposalField): string | undefined {
  const verified = placement.values[field]
  if (placement.proposals[field]) {
    return verified
      ? `Menunggu verifikasi Admission. Versi Admission: ${displayOf(verified)}.`
      : "Menunggu verifikasi Admission."
  }
  return verified ? "Sudah diverifikasi Admission." : undefined
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

export function ProposalForm({
  placement,
  isOnLeave,
}: {
  placement: OwnPlacement
  isOnLeave: boolean
}) {
  const queryClient = useQueryClient()
  const baseline = baselineOf(placement)
  const hasDeparted = placement.values.departureOn !== null
  const lockReason = hasDeparted ? DEPARTED : isOnLeave ? ON_LEAVE : null
  const form = useForm<ProposalValues>({
    initialValues: baseline,
    validate: schemaResolver(proposalFormSchema, { sync: true }),
  })
  const { submit, isPending } = useActionForm({
    form,
    action: (values) => proposePlacement(changesOf(values, baseline)),
    successMessage: "Usulan terkirim. Admission memverifikasinya sebelum berlaku.",
    onSuccess: (data) => queryClient.setQueryData(ownPlacementQuery().queryKey, data),
  })
  const hasChanges = Object.keys(changesOf(form.values, baseline)).length > 0

  const text = (field: Exclude<ProposalField, DateFieldName>) => ({
    ...form.getInputProps(field),
    description: hintOf(placement, field),
    disabled: lockReason !== null,
  })
  const date = (field: DateFieldName) => ({
    placeholder: "Pilih tanggal",
    valueFormat: "DD MMM YYYY",
    clearable: true,
    leftSection: <HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={1.5} />,
    value: form.values[field] || null,
    error: form.errors[field],
    description: hintOf(placement, field),
    disabled: lockReason !== null,
    onChange: (value: string | null) => form.setFieldValue(field, value ?? ""),
  })

  return (
    <form
      className="stack stack-lg"
      noValidate
      onSubmit={(event) => {
        if (hasChanges) return submit(event)
        event.preventDefault()
        notify.info("Belum ada isian yang berubah sejak usulan terakhir.")
      }}
    >
      {lockReason && <Notice tone="neutral">{lockReason}</Notice>}

      <section className="card stack" aria-labelledby="profile-heading">
        <Title order={5} id="profile-heading">
          Data Diri & Program
        </Title>

        <dl className="grid-4" style={{ margin: 0 }}>
          {(
            [
              ["Nama Lengkap", placement.student.name],
              ["Email", placement.email ?? DASH],
              ["Panggilan", placement.student.anrede ?? DASH],
              [
                "Cabang · Program",
                [placement.branch?.name, placement.program?.name].filter(Boolean).join(" · ") ||
                  DASH,
              ],
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
          placeholder="Contoh: Kaufmann/Kauffrau für Spedition und Logistikdienstleistung"
          {...text("fieldOfStudy")}
          description={
            hintOf(placement, "fieldOfStudy") ??
            "Isi persis seperti yang tertulis di kontrak (Ausbildung / Fachkraft)."
          }
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
              {...text("company")}
            />
            <TextInput label="Kota" placeholder="Contoh: München" {...text("city")} />
            <TextInput label="Bundesland" placeholder="Contoh: Bayern" {...text("state")} />
            <TextInput label="Sekolah" placeholder="Nama Berufsschule" {...text("school")} />
            <DateInput label="Tanggal Dimulai Kontrak" {...date("contractStartsOn")} />
            <DateInput label="Tanggal Selesai Kontrak" {...date("contractEndsOn")} />
          </FieldGroup>

          <FieldGroup
            legend="Visa dan keberangkatan"
            hint="Isi urut sesuai tahap yang sudah terjadi."
          >
            <DateInput label="Tanggal Pengajuan Visa" {...date("visaAppliedOn")} />
            <DateInput label="Tanggal Wawancara Visa" {...date("visaInterviewOn")} />
            <DateInput label="Tanggal Visa Terbit" {...date("visaIssuedOn")} />
            <TextInput
              label="Masa Berlaku Visa"
              placeholder="Contoh: 12 bulan"
              {...text("visaValidity")}
            />
            <DateInput
              label="Tanggal Keberangkatan"
              {...date("departureOn")}
              description={
                hintOf(placement, "departureOn") ??
                "Setelah diverifikasi Admission, tanggal ini yang menyalakan status Alumni."
              }
            />
          </FieldGroup>
        </DatesProvider>
      </section>

      {!lockReason && (
        <Group justify="flex-end" gap="sm">
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Mengirim..." : "Kirim Usulan"}
          </button>
        </Group>
      )}
    </form>
  )
}
