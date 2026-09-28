"use client"

import { NumberInput, Select, TextInput } from "@mantine/core"
import { DateInput, DatesProvider, TimeInput } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"

import { FormModal } from "@/src/components/ui/FormModal"
import { schedulePractice } from "@/src/entities/partner/actions"
import { trainersQuery } from "@/src/entities/partner/queries"
import { practiceFormSchema, type PracticeForm } from "@/src/entities/partner/schema"
import { useRead } from "@/src/lib/api/use-read"
import { useActionForm } from "@/src/lib/use-action-form"

import { StudentPicker } from "./StudentPicker"
import { usePartnerOptions } from "./use-partner-options"

export function PracticeFormModal({ onClose }: { onClose: () => void }) {
  const { partners } = usePartnerOptions()
  const trainers = useRead(trainersQuery())
  const form = useForm<PracticeForm>({
    initialValues: {
      studentId: "",
      partnerId: null,
      position: "",
      date: "",
      startsAt: "",
      round: 1,
      trainerUserId: "",
    },
    validate: schemaResolver(practiceFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: schedulePractice,
    successMessage: "Latihan dijadwalkan. Siswa melihat jadwalnya di portal.",
    invalidates: [["interview-practices"]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title="Jadwalkan Latihan Wawancara"
      size="lg"
      submitLabel="Jadwalkan"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <StudentPicker
        value={form.values.studentId}
        error={form.errors.studentId}
        onChange={(next) => form.setFieldValue("studentId", next)}
      />
      <div className="grid-2">
        <Select
          label="Partner yang dilamar"
          placeholder="Pilih partner"
          searchable
          clearable
          data={partners}
          {...form.getInputProps("partnerId")}
        />
        <TextInput
          label="Posisi Dilamar"
          placeholder="Perawat (FSJ)"
          {...form.getInputProps("position")}
        />
      </div>
      <DatesProvider settings={{ locale: "id" }}>
        <div className="grid-2">
          <DateInput
            label="Tanggal"
            placeholder="Pilih tanggal"
            valueFormat="DD MMM YYYY"
            withAsterisk
            {...form.getInputProps("date")}
          />
          <TimeInput label="Jam" withAsterisk {...form.getInputProps("startsAt")} />
        </div>
      </DatesProvider>
      <div className="grid-2">
        <NumberInput
          label="Wawancara Ke"
          description="Simulasi ke berapa untuk siswa ini."
          placeholder="1"
          min={1}
          allowDecimal={false}
          withAsterisk
          {...form.getInputProps("round")}
        />
        <Select
          label="PIC Pelatih"
          placeholder={trainers.isError ? trainers.error.message : "Pilih pelatih"}
          searchable
          withAsterisk
          data={(trainers.data?.data ?? []).map((trainer) => ({
            value: trainer.id,
            label: trainer.name,
          }))}
          {...form.getInputProps("trainerUserId")}
        />
      </div>
    </FormModal>
  )
}
