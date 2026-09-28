"use client"

import { Select, TextInput } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"

import { saveContent } from "@/src/entities/master-data/actions"
import {
  contentFormSchema,
  MASTER_STATUSES,
  type ContentForm,
  type ContentRow,
} from "@/src/entities/master-data/schema"
import { useActionForm } from "@/src/lib/use-action-form"

import { FormModal } from "@/src/components/ui/FormModal"
import { RichTextField } from "./RichTextField"

export function ContentModal({
  initial,
  onClose,
}: {
  initial: ContentRow | undefined
  onClose: () => void
}) {
  const form = useForm<ContentForm>({
    initialValues: {
      name: initial?.name ?? "",
      descriptionHtml: initial?.descriptionHtml ?? "",
      status: initial?.status ?? "Aktif",
    },
    validate: schemaResolver(contentFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => saveContent(initial?.id ?? null, values),
    successMessage: initial ? `Perubahan ${initial.name} disimpan.` : "Konten baru disimpan.",
    invalidates: [["contents"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title={initial ? `Ubah ${initial.name}` : "Tambah Konten"}
      size="lg"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <TextInput
        label="Nama"
        placeholder="Nama konten"
        withAsterisk
        data-autofocus
        {...form.getInputProps("name")}
      />
      <RichTextField
        label="Deskripsi"
        defaultValue={initial?.descriptionHtml}
        placeholder="Tulis isi konten"
        error={form.errors.descriptionHtml}
        onChange={(html) => form.setFieldValue("descriptionHtml", html)}
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
