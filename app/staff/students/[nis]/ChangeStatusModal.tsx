"use client"

import { FileInput, Select, Textarea } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"
import { useState } from "react"

import { FormModal } from "@/src/components/ui/FormModal"
import { changeStatus, presignStatusEvidence } from "@/src/entities/student/actions"
import {
  changeStatusFormSchema,
  STATUS_BADGE,
  STUDENT_STATUSES,
  type StudentDetail,
} from "@/src/entities/student/schema"
import { failureOf, type ActionResult } from "@/src/lib/api/errors"
import {
  isUploadable,
  putToStorage,
  UPLOAD_ACCEPT,
  UPLOAD_FAILED,
  UPLOAD_RULE,
} from "@/src/lib/upload"
import { useActionForm } from "@/src/lib/use-action-form"

const ALUMNI_NOTE =
  "Alumni menyala otomatis saat tanggal keberangkatan terisi di Visa & Penempatan."
const EVIDENCE_FIELD = "evidenceId"

type StatusFormValues = { status: string | null; effectiveAt: string; reason: string }

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })

async function uploadEvidence(nis: string, file: File): Promise<ActionResult<string>> {
  if (!isUploadable(file)) return failureOf(UPLOAD_RULE, EVIDENCE_FIELD)
  const presigned = await presignStatusEvidence(nis, file.type, file.size)
  if (!presigned.ok) return presigned
  if (!(await putToStorage(presigned.data, file))) return failureOf(UPLOAD_FAILED, EVIDENCE_FIELD)
  return { ok: true, data: presigned.data.evidenceId }
}

export function ChangeStatusModal({
  student,
  onClose,
}: {
  student: StudentDetail
  onClose: () => void
}) {
  const [evidence, setEvidence] = useState<File | null>(null)
  const form = useForm<StatusFormValues>({
    initialValues: { status: null, effectiveAt: today(), reason: "" },
    validate: schemaResolver(changeStatusFormSchema, { sync: true }),
  })

  const { submit, isPending, formError } = useActionForm({
    form,
    action: async (values) => {
      let evidenceId: string | null = null
      if (evidence) {
        const uploaded = await uploadEvidence(student.nis, evidence)
        if (!uploaded.ok) return uploaded
        evidenceId = uploaded.data
      }
      return changeStatus(student.nis, changeStatusFormSchema.parse(values), evidenceId)
    },
    successMessage: `Status ${student.name} diubah. Tercatat di Log Aktivitas dan tab Riwayat.`,
    invalidates: [["students"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title={`Ubah Status ${student.name}`}
      submitLabel="Simpan Status"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <div className="row" style={{ gap: 8 }}>
        <span className="caption text-muted">Status saat ini</span>
        <span className={`badge ${STATUS_BADGE[student.status]}`}>{student.status}</span>
      </div>
      <Select
        label="Status baru"
        placeholder="Pilih status"
        description={ALUMNI_NOTE}
        data={STUDENT_STATUSES.map((status) => ({
          value: status,
          label: status,
          disabled: status === student.status || status === "Alumni",
        }))}
        withAsterisk
        {...form.getInputProps("status")}
      />
      <DatesProvider settings={{ locale: "id" }}>
        <DateInput
          label="Tanggal berlaku"
          valueFormat="DD MMMM YYYY"
          withAsterisk
          {...form.getInputProps("effectiveAt")}
        />
      </DatesProvider>
      <Textarea
        label="Alasan"
        placeholder="Tulis alasan perubahan status"
        autosize
        minRows={2}
        withAsterisk
        {...form.getInputProps("reason")}
      />
      <FileInput
        label="Berkas pendukung"
        description="Boleh kosong. Satu berkas PDF, JPG, atau PNG paling besar 5 MB."
        placeholder="Pilih berkas"
        accept={UPLOAD_ACCEPT}
        clearable
        value={evidence}
        onChange={setEvidence}
        error={form.errors[EVIDENCE_FIELD]}
      />
    </FormModal>
  )
}
