"use client"

import { NumberInput, Select, TextInput } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"

import { FormModal } from "@/src/components/ui/FormModal"
import { createExamSchedule } from "@/src/entities/certificate/actions"
import { SCHEDULE_KEYS } from "@/src/entities/certificate/queries"
import { scheduleFormSchema, type ScheduleForm } from "@/src/entities/certificate/schema"
import { useActionForm } from "@/src/lib/use-action-form"

import { useExamOptions } from "./use-exam-options"

export function ScheduleFormModal({ onClose }: { onClose: () => void }) {
  const { levels, kinds } = useExamOptions()
  const form = useForm<ScheduleForm>({
    initialValues: { kindId: "", levelId: "", date: "", location: "", capacity: "" },
    validate: schemaResolver(scheduleFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) =>
      createExamSchedule({ ...values, capacity: values.capacity === "" ? 0 : values.capacity }),
    successMessage: "Jadwal ujian disimpan dan tampil di Kalender Akademik.",
    invalidates: [...SCHEDULE_KEYS, ["class-calendar"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title="Tambah Jadwal Ujian"
      submitLabel="Simpan Jadwal"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <div className="grid-2">
        <Select
          label="Penyelenggara"
          placeholder="Pilih"
          withAsterisk
          data={[...kinds]}
          {...form.getInputProps("kindId")}
        />
        <Select
          label="Level"
          placeholder="Pilih level"
          withAsterisk
          data={[...levels]}
          {...form.getInputProps("levelId")}
        />
      </div>
      <DatesProvider settings={{ locale: "id" }}>
        <DateInput
          label="Tanggal Ujian"
          placeholder="Pilih tanggal"
          valueFormat="DD MMM YYYY"
          withAsterisk
          {...form.getInputProps("date")}
        />
      </DatesProvider>
      <TextInput
        label="Lokasi"
        placeholder="Pusat Jakarta"
        withAsterisk
        {...form.getInputProps("location")}
      />
      <NumberInput
        label="Kuota"
        description="Pendaftaran di atas kuota butuh konfirmasi."
        placeholder="30"
        min={1}
        max={500}
        allowDecimal={false}
        withAsterisk
        {...form.getInputProps("capacity")}
      />
    </FormModal>
  )
}
