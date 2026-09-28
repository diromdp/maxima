"use client"

import { TextInput } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"

import { saveHoliday } from "@/src/entities/master-data/actions"
import {
  holidayFormSchema,
  type HolidayForm,
  type HolidayRow,
} from "@/src/entities/master-data/schema"
import { useActionForm } from "@/src/lib/use-action-form"

import { FormModal } from "@/src/components/ui/FormModal"

export function HolidayModal({
  initial,
  onClose,
}: {
  initial: HolidayRow | undefined
  onClose: () => void
}) {
  const form = useForm<HolidayForm>({
    initialValues: { name: initial?.name ?? "", date: initial?.date ?? "" },
    validate: schemaResolver(holidayFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => saveHoliday(initial?.id ?? null, values),
    successMessage: initial
      ? `Perubahan ${initial.name} disimpan.`
      : "Tanggal libur baru disimpan.",
    invalidates: [["academic-holidays"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title={initial ? `Ubah ${initial.name}` : "Tambah Tanggal Libur"}
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <TextInput
        label="Nama Libur"
        placeholder="Hari Kemerdekaan"
        withAsterisk
        data-autofocus
        {...form.getInputProps("name")}
      />
      <DatesProvider settings={{ locale: "id" }}>
        <DateInput
          label="Tanggal"
          description="Sesi kelas aktif di tanggal ini tidak terbit dan pertemuannya tidak diganti."
          placeholder="Pilih tanggal"
          valueFormat="DD MMMM YYYY"
          withAsterisk
          {...form.getInputProps("date")}
        />
      </DatesProvider>
    </FormModal>
  )
}
