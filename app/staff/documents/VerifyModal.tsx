"use client"

import { useForm } from "@mantine/form"

import { FormModal } from "@/src/components/ui/FormModal"
import { verifyDocument } from "@/src/entities/document/actions"
import { documentKeysOf } from "@/src/entities/document/queries"
import type { DocumentItem } from "@/src/entities/document/schema"
import { useActionForm } from "@/src/lib/use-action-form"

export function VerifyModal({
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
  const form = useForm({ initialValues: {} })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: () => verifyDocument(item.documentId ?? "", item.uploadedAt ?? ""),
    successMessage: `${item.name} milik ${studentName} terverifikasi.`,
    invalidates: documentKeysOf(nis),
    onSuccess: onClose,
  })

  return (
    <FormModal
      title={`Verifikasi ${item.name}?`}
      submitLabel="Verifikasi"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <p className="body-sm">
        Berkas {item.name} milik {studentName} ditandai Lengkap dan ikut menghitung kelengkapan
        rumpunnya. Siswa melihatnya sebagai Terverifikasi.
      </p>
    </FormModal>
  )
}
