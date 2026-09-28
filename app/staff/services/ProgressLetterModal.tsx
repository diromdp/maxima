"use client"

import { Textarea } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"
import { useState } from "react"

import { FormModal } from "@/src/components/ui/FormModal"
import { type ProgressLetterForm, progressLetterFormSchema } from "@/src/entities/service/schema"
import { openRenderedFile } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { notify } from "@/src/lib/notify"

export function ProgressLetterModal({ nis, onClose }: { nis: string; onClose: () => void }) {
  const [isPending, setIsPending] = useState(false)
  const form = useForm<ProgressLetterForm>({
    initialValues: { stage: "", additionalNote: "" },
    validate: schemaResolver(progressLetterFormSchema, { sync: true }),
  })

  const submit = form.onSubmit(async (values) => {
    setIsPending(true)
    try {
      await openRenderedFile(`/print/students/${encodeURIComponent(nis)}/progress-letter`, {
        stage: values.stage.trim(),
        additionalNote: values.additionalNote.trim(),
      })
      onClose()
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
      const fieldErrors = Object.fromEntries(
        error.details.map((detail) => [detail.field, detail.message]),
      )
      if (Object.keys(fieldErrors).length > 0) form.setErrors(fieldErrors)
      else notify.error(error.message)
    } finally {
      setIsPending(false)
    }
  })

  return (
    <FormModal
      title="Cetak Surat Keterangan Progres Siswa"
      submitLabel="Cetak"
      formError={null}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <Textarea
        label="Tahap Proses"
        placeholder="Contoh: Menunggu hasil wawancara di partner ketiga"
        autosize
        minRows={2}
        withAsterisk
        data-autofocus
        {...form.getInputProps("stage")}
      />
      <Textarea
        label="Catatan Tambahan"
        placeholder="Keterangan lain yang ikut tercetak"
        autosize
        minRows={2}
        {...form.getInputProps("additionalNote")}
      />
    </FormModal>
  )
}
