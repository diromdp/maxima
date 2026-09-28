"use client"

import { Textarea } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"

import { FormModal } from "@/src/components/ui/FormModal"
import { Notice } from "@/src/components/ui/Notice"
import { rejectDocument } from "@/src/entities/document/actions"
import { documentKeysOf } from "@/src/entities/document/queries"
import { type DocumentItem, rejectDocumentFormSchema } from "@/src/entities/document/schema"
import { useActionForm } from "@/src/lib/use-action-form"

export function RejectModal({
  nis,
  studentName,
  item,
  onClose,
}: {
  nis: string
  studentName: string
  item: DocumentItem
  onClose: () => void
}) {
  const form = useForm({
    initialValues: { reason: "" },
    validate: schemaResolver(rejectDocumentFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => rejectDocument(item.documentId ?? "", item.uploadedAt ?? "", values),
    successMessage: `${item.name} ditolak. Alasan tampil di portal ${studentName}.`,
    invalidates: documentKeysOf(nis),
    onSuccess: onClose,
  })

  return (
    <FormModal
      title={`Tolak ${item.name}`}
      submitLabel="Tolak Berkas"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <Notice tone="warning">
        Alasan ini dibaca {studentName} apa adanya di portal, di samping tombol unggah ulang. Sebut
        apa yang salah dan apa yang harus diunggah.
      </Notice>
      <Textarea
        label="Alasan penolakan"
        description={item.originalName ? `Berkas yang ditolak: ${item.originalName}` : undefined}
        placeholder="Contoh: Hasil pindai buram, nama tidak terbaca. Unggah ulang dengan pindaian berwarna."
        autosize
        minRows={3}
        withAsterisk
        {...form.getInputProps("reason")}
      />
    </FormModal>
  )
}
