"use client"

import { MultiSelect, NumberInput, Select, TextInput } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"

import { FormModal } from "@/src/components/ui/FormModal"
import { savePromo } from "@/src/entities/package/actions"
import {
  DISCOUNT_TYPES,
  EDITABLE_PROMO_STATUSES,
  type PackageView,
  promoFormSchema,
  type PromoForm,
  type PromoView,
} from "@/src/entities/package/schema"
import { useActionForm } from "@/src/lib/use-action-form"

const formOf = (initial: PromoView | undefined): PromoForm => ({
  name: initial?.name ?? "",
  code: initial?.code ?? "",
  discountType: initial?.discountType ?? "Persentase",
  value: (initial?.discountType === "Nominal" ? initial.amountIdr : initial?.percent) ?? "",
  packageIds: initial?.packages.map((pkg) => pkg.id) ?? [],
  startsOn: initial?.startsOn ?? "",
  endsOn: initial?.endsOn ?? "",
  status: initial && initial.status !== "DRAFT" ? "AKTIF" : "DRAFT",
})

export function PromoFormModal({
  initial,
  packages,
  onClose,
}: {
  initial: PromoView | undefined
  packages: readonly PackageView[]
  onClose: () => void
}) {
  const form = useForm<PromoForm>({
    initialValues: formOf(initial),
    validate: schemaResolver(promoFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => savePromo(initial?.id ?? null, values),
    successMessage: initial ? `Perubahan ${initial.name} disimpan.` : "Promo baru disimpan.",
    invalidates: [["promos"]],
    onSuccess: onClose,
  })

  const isPercent = form.values.discountType === "Persentase"
  const selected = form.values.packageIds
  const packageOptions = packages
    .filter((pkg) => pkg.status === "Aktif" || selected.includes(pkg.id))
    .map((pkg) => ({ value: pkg.id, label: pkg.name }))

  return (
    <FormModal
      title={initial ? `Ubah ${initial.name}` : "Tambah Promo"}
      size="lg"
      submitLabel={initial ? "Simpan Perubahan" : "Simpan Promo"}
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <div className="grid-2">
        <TextInput
          label="Nama Promo"
          placeholder="Promo Awal Tahun"
          withAsterisk
          data-autofocus
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Kode Voucher"
          description="Yang diketik siswa di formulir pendaftaran."
          placeholder="AWAL2026"
          withAsterisk
          {...form.getInputProps("code")}
          onChange={(event) => form.setFieldValue("code", event.currentTarget.value.toUpperCase())}
        />
      </div>

      <div className="grid-2">
        <Select
          label="Jenis Diskon"
          data={[...DISCOUNT_TYPES]}
          allowDeselect={false}
          withAsterisk
          {...form.getInputProps("discountType")}
          onChange={(value) => {
            if (!value || value === form.values.discountType) return
            form.setValues({ discountType: value as PromoForm["discountType"], value: "" })
          }}
        />
        <NumberInput
          key={form.values.discountType}
          label="Nilai Diskon"
          placeholder={isPercent ? "10" : "1.500.000"}
          min={1}
          max={isPercent ? 100 : undefined}
          allowDecimal={false}
          hideControls
          withAsterisk
          {...(isPercent
            ? { suffix: " %" }
            : { prefix: "Rp ", thousandSeparator: ".", decimalSeparator: "," })}
          {...form.getInputProps("value")}
        />
      </div>

      <MultiSelect
        label="Berlaku Untuk"
        description="Kosongkan bila berlaku untuk semua paket."
        placeholder={selected.length === 0 ? "Semua Paket" : undefined}
        data={packageOptions}
        clearable
        {...form.getInputProps("packageIds")}
      />

      <DatesProvider settings={{ locale: "id" }}>
        <div className="grid-3">
          <DateInput
            label="Mulai"
            placeholder="Pilih tanggal"
            valueFormat="DD/MM/YYYY"
            withAsterisk
            {...form.getInputProps("startsOn")}
          />
          <DateInput
            label="Selesai"
            placeholder="Pilih tanggal"
            valueFormat="DD/MM/YYYY"
            withAsterisk
            {...form.getInputProps("endsOn")}
          />
          <Select
            label="Status"
            description="KEDALUWARSA terbaca sendiri setelah tanggal selesai."
            data={[...EDITABLE_PROMO_STATUSES]}
            allowDeselect={false}
            {...form.getInputProps("status")}
          />
        </div>
      </DatesProvider>
    </FormModal>
  )
}
