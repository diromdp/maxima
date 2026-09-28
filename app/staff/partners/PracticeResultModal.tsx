"use client"

import { Radio, Textarea } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"

import { FormModal } from "@/src/components/ui/FormModal"
import { recordPracticeResult } from "@/src/entities/partner/actions"
import {
  PRACTICE_RESULTS,
  practiceResultFormSchema,
  type PracticeResultForm,
  type PracticeRow,
} from "@/src/entities/partner/schema"
import { DASH, formatDate } from "@/src/lib/format"
import { useActionForm } from "@/src/lib/use-action-form"

export function PracticeResultModal({
  practice,
  onClose,
}: {
  practice: PracticeRow
  onClose: () => void
}) {
  const form = useForm<PracticeResultForm>({
    initialValues: {
      status: practice.status === "Dibatalkan" ? "Dibatalkan" : "Selesai",
      result: practice.result,
      evaluation: practice.evaluation ?? "",
    },
    validate: schemaResolver(practiceResultFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => recordPracticeResult(practice.id, values),
    successMessage:
      form.values.status === "Selesai"
        ? `Hasil latihan dicatat: ${form.values.result ?? ""}. Siswa melihatnya di portal.`
        : "Latihan ditandai dibatalkan.",
    invalidates: [["interview-practices"]],
    onSuccess: onClose,
  })
  const isDone = form.values.status === "Selesai"

  return (
    <FormModal
      title={`Catat Hasil Simulasi ${practice.round}`}
      submitLabel="Simpan Hasil"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <dl className="row row-wrap" style={{ gap: 20, margin: 0 }}>
        {[
          { label: "Siswa", value: practice.student.name },
          { label: "Partner", value: practice.partner?.name ?? DASH },
          { label: "Tanggal", value: formatDate(practice.date) },
          { label: "Pelatih", value: practice.trainer?.name ?? DASH },
        ].map(({ label, value }) => (
          <div key={label} className="stack" style={{ gap: 2 }}>
            <dt className="caption text-muted">{label}</dt>
            <dd className="body-sm" style={{ fontWeight: 600, margin: 0 }}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <Radio.Group label="Status latihan" {...form.getInputProps("status")}>
        <div className="row row-wrap" style={{ gap: 16, marginTop: 8 }}>
          <Radio value="Selesai" label="Selesai" />
          <Radio value="Dibatalkan" label="Dibatalkan" />
        </div>
      </Radio.Group>

      {isDone && (
        <Radio.Group
          label="Hasil / Evaluasi"
          description="Siap berarti boleh lanjut ke interview partner; Latihan Lagi menjadwalkan simulasi berikutnya."
          withAsterisk
          {...form.getInputProps("result")}
        >
          <div className="row row-wrap" style={{ gap: 16, marginTop: 8 }}>
            {PRACTICE_RESULTS.map((option) => (
              <Radio key={option} value={option} label={option} />
            ))}
          </div>
        </Radio.Group>
      )}

      <Textarea
        label={isDone ? "Catatan pelatih" : "Alasan pembatalan"}
        placeholder={
          isDone
            ? "Contoh: Jawaban runtut, perlu latihan pertanyaan gaji dan motivasi."
            : "Contoh: Siswa sakit, dijadwalkan ulang minggu depan."
        }
        autosize
        minRows={3}
        withAsterisk={!isDone}
        {...form.getInputProps("evaluation")}
      />
    </FormModal>
  )
}
