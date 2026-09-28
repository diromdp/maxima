"use client"

import { Checkbox, Select, TextInput } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"

import { saveDocumentType } from "@/src/entities/master-data/actions"
import {
  DOCUMENT_GROUPS,
  documentTypeFormSchema,
  MASTER_STATUSES,
  type DocumentTypeForm,
  type DocumentTypeRow,
} from "@/src/entities/master-data/schema"
import { useActionForm } from "@/src/lib/use-action-form"

import { FormModal } from "@/src/components/ui/FormModal"

export function DocumentTypeModal({
  initial,
  onClose,
}: {
  initial: DocumentTypeRow | undefined
  onClose: () => void
}) {
  const form = useForm<DocumentTypeForm>({
    initialValues: {
      name: initial?.name ?? "",
      group: initial?.group ?? "Pribadi",
      required: initial?.required ?? false,
      status: initial?.status ?? "Aktif",
    },
    validate: schemaResolver(documentTypeFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => saveDocumentType(initial?.id ?? null, values),
    successMessage: initial
      ? `Perubahan ${initial.name} disimpan.`
      : "Jenis dokumen baru disimpan.",
    invalidates: [["document-types"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title={initial ? `Ubah ${initial.name}` : "Tambah Jenis Dokumen"}
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <TextInput
        label="Nama"
        placeholder="Nama jenis dokumen"
        withAsterisk
        data-autofocus
        {...form.getInputProps("name")}
      />
      <Select
        label="Rumpun"
        description="Rumpun jenis yang sudah dipakai berkas siswa tidak dapat diganti."
        data={[...DOCUMENT_GROUPS]}
        allowDeselect={false}
        withAsterisk
        {...form.getInputProps("group")}
      />
      <Checkbox
        label="Wajib"
        description="Dokumen wajib dihitung dalam kelengkapan berkas siswa."
        {...form.getInputProps("required", { type: "checkbox" })}
      />
      <Select
        label="Status"
        data={[...MASTER_STATUSES]}
        allowDeselect={false}
        {...form.getInputProps("status")}
      />
    </FormModal>
  )
}
