"use client"

import { Textarea } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"

import { FormModal } from "@/src/components/ui/FormModal"
import {
  type LeaveDetail,
  type RejectionForm,
  rejectionFormSchema,
} from "@/src/entities/leave/schema"
import type { ActionResult } from "@/src/lib/api/errors"
import { formatDateLong } from "@/src/lib/format"
import { useActionForm } from "@/src/lib/use-action-form"

import { Field } from "./LeavePanels"

type RejectValues = { reason: string; reapplyFrom: string | null }

export function RejectModal({
  leave,
  reject,
  onClose,
}: {
  leave: LeaveDetail
  reject: (values: RejectionForm) => Promise<ActionResult>
  onClose: () => void
}) {
  const form = useForm<RejectValues>({
    initialValues: { reason: "", reapplyFrom: null },
    validate: schemaResolver(rejectionFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => reject(rejectionFormSchema.parse(values)),
    successMessage: `Pengajuan ${leave.student.name} ditolak. Siswa diberi tahu di portal dan surel.`,
    invalidates: [["leaves"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title="Tolak Pengajuan Cuti"
      size="lg"
      submitLabel="Konfirmasi Penolakan"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <div className="grid-2">
        <Field label="Siswa" value={`${leave.student.name} · NIS ${leave.student.nis ?? "-"}`} />
        <Field
          label="Periode"
          value={`${formatDateLong(leave.startsOn)} - ${formatDateLong(leave.returnsOn)}`}
        />
      </div>
      <Textarea
        label="Keterangan untuk siswa"
        description="Dibaca siswa apa adanya di portal. Sebut apa yang harus ia lakukan."
        placeholder="Contoh: Lunasi tiga angsuran tertunggak, lalu ajukan kembali."
        autosize
        minRows={3}
        withAsterisk
        {...form.getInputProps("reason")}
      />
      <DatesProvider settings={{ locale: "id" }}>
        <DateInput
          label="Dapat diajukan ulang mulai"
          description="Penolakan wajib menyebut jalan keluarnya."
          placeholder="Pilih tanggal"
          valueFormat="DD MMMM YYYY"
          minDate={new Date()}
          withAsterisk
          {...form.getInputProps("reapplyFrom")}
        />
      </DatesProvider>
    </FormModal>
  )
}
