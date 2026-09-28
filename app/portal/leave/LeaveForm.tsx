"use client"

import { Checkbox, FileInput, Skeleton, Stack, Textarea } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"
import { Calendar03Icon, Upload04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { Notice } from "@/src/components/ui/Notice"
import { presignLeaveEvidence, submitLeave } from "@/src/entities/leave/actions"
import { ownLeavesQuery } from "@/src/entities/leave/queries"
import {
  latestReturnDate,
  type LeaveDetail,
  leaveMonths,
  leaveRequestFormSchema,
  MAX_LEAVE_MONTHS,
  type OwnLeaves,
  positionLabel,
} from "@/src/entities/leave/schema"
import { type ActionResult, failureOf } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import type { PortalStatus } from "@/src/lib/auth/session"
import { formatDateLong, formatFileSize } from "@/src/lib/format"
import {
  isUploadable,
  putToStorage,
  UPLOAD_ACCEPT,
  UPLOAD_FAILED,
  UPLOAD_RULE,
} from "@/src/lib/upload"
import { useActionForm } from "@/src/lib/use-action-form"

import { CardHeader } from "./CardHeader"
import { applyBlockOf, earliestLeaveStart, TERMS } from "./leave"

const EVIDENCE_FIELD = "evidenceId"
const TERMS_FIELD = "agreedTerms"

type LeaveFormValues = {
  startsOn: string | null
  returnsOn: string | null
  reason: string
  agreedTerms: string[]
}

const calendarIcon = <HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={1.5} />

async function uploadEvidence(file: File): Promise<ActionResult<string>> {
  if (!isUploadable(file)) return failureOf(UPLOAD_RULE, EVIDENCE_FIELD)
  const presigned = await presignLeaveEvidence(file.type, file.size)
  if (!presigned.ok) return presigned
  if (!(await putToStorage(presigned.data, file))) return failureOf(UPLOAD_FAILED, EVIDENCE_FIELD)
  return { ok: true, data: presigned.data.evidenceId }
}

function RequestForm({ history, status }: { history: OwnLeaves; status: PortalStatus }) {
  const router = useRouter()
  const [evidence, setEvidence] = useState<File | null>(null)
  const earliest = earliestLeaveStart()
  const block = applyBlockOf(history.data, status)
  const resolveSchema = schemaResolver(leaveRequestFormSchema, { sync: true })

  const form = useForm<LeaveFormValues>({
    initialValues: { startsOn: null, returnsOn: null, reason: "", agreedTerms: [] },
    validate: (values) => ({
      ...resolveSchema(values),
      ...(values.startsOn && values.startsOn < earliest
        ? { startsOn: `Tanggal mulai paling cepat ${formatDateLong(earliest)}.` }
        : {}),
      ...(values.agreedTerms.length === TERMS.length
        ? {}
        : { [TERMS_FIELD]: "Centang seluruh ketentuan sebelum mengirim." }),
      ...(evidence ? {} : { [EVIDENCE_FIELD]: "Unggah dokumen pendukung lebih dulu." }),
    }),
  })

  const { submit, isPending, formError } = useActionForm({
    form,
    action: async (values): Promise<ActionResult<LeaveDetail>> => {
      if (!evidence) return failureOf("Unggah dokumen pendukung lebih dulu.", EVIDENCE_FIELD)
      const uploaded = await uploadEvidence(evidence)
      if (!uploaded.ok) return uploaded
      return submitLeave(leaveRequestFormSchema.parse(values), uploaded.data)
    },
    successMessage: "Pengajuan cuti terkirim. Finance memverifikasinya lebih dulu.",
    invalidates: [["leaves", "me"]],
    onSuccess: (leave) => router.push(`/portal/leave/${leave.id}`),
  })

  const { startsOn, returnsOn } = form.values
  const months =
    startsOn && returnsOn && returnsOn > startsOn ? leaveMonths(startsOn, returnsOn) : null
  const { name, position } = history.form

  return (
    <form className="stack stack-lg" onSubmit={submit} noValidate>
      {block && <Notice tone="warning">{block}</Notice>}
      {formError && <Notice tone="danger">{formError}</Notice>}

      <section className="card stack">
        <CardHeader title="Formulir Pengajuan" note="wajib lengkap sebelum dikirim" />

        <dl className="grid-3" style={{ margin: 0 }}>
          {(
            [
              ["Nama Lengkap", name],
              ["Kelas Saat Ini", position.className ?? "Belum tercatat"],
              ["Level dan Kapitel Terakhir", positionLabel(position)],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="stack" style={{ gap: 2 }}>
              <dt className="spec-name">{label}</dt>
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
                description={`Paling cepat ${formatDateLong(earliest)}, satu bulan dari hari ini.`}
                placeholder="Pilih tanggal"
                valueFormat="DD MMM YYYY"
                minDate={earliest}
                leftSection={calendarIcon}
                withAsterisk
                {...form.getInputProps("startsOn")}
              />
              <DateInput
                label="Tanggal Rencana Masuk Kembali"
                description={`Paling lama ${MAX_LEAVE_MONTHS} bulan setelah tanggal mulai.`}
                placeholder="Pilih tanggal"
                valueFormat="DD MMM YYYY"
                minDate={startsOn ?? earliest}
                maxDate={startsOn ? latestReturnDate(startsOn) : undefined}
                leftSection={calendarIcon}
                withAsterisk
                {...form.getInputProps("returnsOn")}
              />
            </div>
          </DatesProvider>

          <div className="row-soft">
            <span className="spec-name">Masa Cuti</span>
            <span
              className={`body-sm${months === null ? " text-muted" : ""}`}
              style={{ fontWeight: 600 }}
            >
              {months === null ? "Belum dapat dihitung" : `${months} bulan`}
            </span>
          </div>

          <Textarea
            label="Alasan Cuti"
            description="Tulis singkat dan jelas. Finance membacanya saat memverifikasi."
            placeholder="Contoh: mendampingi orang tua yang sedang dirawat di luar kota"
            autosize
            minRows={4}
            withAsterisk
            {...form.getInputProps("reason")}
          />

          <FileInput
            label="Dokumen Pendukung"
            description={
              evidence
                ? `${evidence.name} · ${formatFileSize(evidence.size)}`
                : `Surat keterangan yang menguatkan alasan Anda. ${UPLOAD_RULE}`
            }
            placeholder="Pilih berkas"
            leftSection={<HugeiconsIcon icon={Upload04Icon} size={16} strokeWidth={1.5} />}
            clearable
            withAsterisk
            accept={UPLOAD_ACCEPT}
            value={evidence}
            onChange={setEvidence}
            error={form.errors[EVIDENCE_FIELD]}
          />
        </Stack>
      </section>

      <section className="card stack">
        <CardHeader
          title="Ketentuan"
          note={`${form.values.agreedTerms.length} dari ${TERMS.length} dicentang, wajib semua`}
        />

        <Checkbox.Group {...form.getInputProps(TERMS_FIELD)}>
          <div className="list-rows">
            {TERMS.map((term) => (
              <Checkbox key={term} value={term} label={term} />
            ))}
          </div>
        </Checkbox.Group>
      </section>

      <div className="row row-between row-wrap" style={{ gap: 12 }}>
        <span className="caption text-muted" aria-live="polite">
          Pengajuan masuk ke Finance begitu dikirim.
        </span>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending || block !== null}
          title={block ?? undefined}
        >
          {isPending ? "Mengirim..." : "Kirim Pengajuan"}
        </button>
      </div>
    </form>
  )
}

export function LeaveForm({ status }: { status: PortalStatus }) {
  const history = useRead(ownLeavesQuery())

  if (history.isError) {
    return <QueryError message={history.error.message} onRetry={() => void history.refetch()} />
  }
  if (history.isPending) return <LeaveFormSkeleton />
  return <RequestForm history={history.data} status={status} />
}

export function LeaveFormSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <Skeleton height={520} radius="md" aria-hidden />
      <Skeleton height={320} radius="md" aria-hidden />
    </div>
  )
}
