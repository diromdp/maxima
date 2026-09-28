"use client"

import { Select, TextInput } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"

import { saveMasterItem } from "@/src/entities/master-data/actions"
import {
  branchFormSchema,
  MASTER_STATUSES,
  masterItemFormSchema,
  type MasterItemForm,
  type MasterItemRow,
  type MasterType,
} from "@/src/entities/master-data/schema"
import { useActionForm } from "@/src/lib/use-action-form"

import { FormModal } from "@/src/components/ui/FormModal"

export function MasterItemModal({
  type,
  title,
  initial,
  onClose,
}: {
  type: MasterType
  title: string
  initial: MasterItemRow | undefined
  onClose: () => void
}) {
  const isBranch = type === "branch"
  const initialCode = initial?.code ?? null
  const form = useForm<MasterItemForm>({
    initialValues: {
      name: initial?.name ?? "",
      status: initial?.status ?? "Aktif",
      code: initial?.code ?? "",
      contactEmail: initial?.contactEmail ?? "",
      contactPhone: initial?.contactPhone ?? "",
    },
    validate: schemaResolver(isBranch ? branchFormSchema(initialCode) : masterItemFormSchema, {
      sync: true,
    }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => saveMasterItem(type, initial?.id ?? null, values, initialCode),
    successMessage: initial ? `Perubahan ${initial.name} disimpan.` : `${title} baru disimpan.`,
    invalidates: [["master-items"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title={initial ? `Ubah ${initial.name}` : `Tambah ${title}`}
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      {isBranch && (
        <TextInput
          label="Kode Cabang"
          description="Tiga huruf besar, misalnya BDG. Kode tercetak di NIS dan No Kontrak, jadi hanya dapat diganti selama cabang belum dipakai."
          placeholder="BDG"
          withAsterisk
          data-autofocus
          {...form.getInputProps("code")}
          onChange={(event) => form.setFieldValue("code", event.currentTarget.value.toUpperCase())}
        />
      )}
      <TextInput
        label="Nama"
        placeholder={`Nama ${title.toLowerCase()}`}
        withAsterisk
        data-autofocus={!isBranch || undefined}
        {...form.getInputProps("name")}
      />
      {isBranch && (
        <div className="grid-2">
          <TextInput
            label="Surel"
            type="email"
            placeholder="Boleh kosong"
            {...form.getInputProps("contactEmail")}
          />
          <TextInput
            label="Telepon"
            type="tel"
            placeholder="Boleh kosong"
            {...form.getInputProps("contactPhone")}
          />
        </div>
      )}
      <Select
        label="Status"
        data={[...MASTER_STATUSES]}
        allowDeselect={false}
        {...form.getInputProps("status")}
      />
    </FormModal>
  )
}
