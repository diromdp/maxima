"use client"

import { NumberInput, Select, TextInput } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"

import { FormModal } from "@/src/components/ui/FormModal"
import { useMasterOptions } from "@/src/entities/master-data/use-master-options"
import { savePartner } from "@/src/entities/partner/actions"
import {
  PARTNERSHIP_STATUSES,
  partnerFormSchema,
  type PartnerForm,
  type PartnerRow,
} from "@/src/entities/partner/schema"
import { useActionForm } from "@/src/lib/use-action-form"

const initialOf = (partner?: PartnerRow): PartnerForm => ({
  name: partner?.name ?? "",
  city: partner?.city ?? "",
  categoryId: partner?.category?.id ?? null,
  openPositions: partner?.openPositions ?? "",
  status: partner?.status ?? "Aktif",
  contactName: partner?.contactName ?? "",
  contactEmail: partner?.contactEmail ?? "",
  contactPhone: partner?.contactPhone ?? "",
})

export function PartnerFormModal({
  initial,
  onClose,
}: {
  initial?: PartnerRow
  onClose: () => void
}) {
  const { partnerCategories } = useMasterOptions()
  const form = useForm<PartnerForm>({
    initialValues: initialOf(initial),
    validate: schemaResolver(partnerFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => savePartner(initial?.id ?? null, values),
    successMessage: initial ? `Perubahan ${initial.name} disimpan.` : "Partner baru disimpan.",
    invalidates: [["partners"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title={initial ? `Ubah ${initial.name}` : "Tambah Partner"}
      size="lg"
      submitLabel="Simpan Partner"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <TextInput
        label="Nama Perusahaan"
        placeholder="Asklepios Kliniken"
        withAsterisk
        data-autofocus
        {...form.getInputProps("name")}
      />
      <div className="grid-2">
        <TextInput label="Kota" placeholder="Hamburg" {...form.getInputProps("city")} />
        <Select
          label="Industri"
          placeholder="Pilih industri"
          data={[...partnerCategories]}
          clearable
          {...form.getInputProps("categoryId")}
        />
      </div>
      <div className="grid-2">
        <NumberInput
          label="Posisi Tersedia"
          placeholder="0"
          min={0}
          allowDecimal={false}
          withAsterisk
          {...form.getInputProps("openPositions")}
        />
        <Select
          label="Status Kerjasama"
          data={[...PARTNERSHIP_STATUSES]}
          allowDeselect={false}
          withAsterisk
          {...form.getInputProps("status")}
        />
      </div>
      <div className="stack stack-sm">
        <span className="field-label">Kontak PIC</span>
        <TextInput
          aria-label="Nama kontak PIC"
          placeholder="Nama, misalnya Dr. Müller"
          {...form.getInputProps("contactName")}
        />
        <div className="grid-2">
          <TextInput
            aria-label="Telepon kontak PIC"
            placeholder="Telepon, misalnya +49 40 1234567"
            {...form.getInputProps("contactPhone")}
          />
          <TextInput
            aria-label="Surel kontak PIC"
            type="email"
            placeholder="Surel, misalnya mueller@asklepios.de"
            {...form.getInputProps("contactEmail")}
          />
        </div>
      </div>
    </FormModal>
  )
}
