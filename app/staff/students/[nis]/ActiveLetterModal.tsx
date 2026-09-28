"use client"

import { TextInput } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"
import { useState } from "react"

import { FormModal } from "@/src/components/ui/FormModal"
import {
  activeLetterFormSchema,
  type ActiveLetterForm,
  type StudentDetail,
} from "@/src/entities/student/schema"
import { openRenderedFile } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { notify } from "@/src/lib/notify"

const DEFAULT_SUBJECT = "Surat Keterangan Siswa Aktif"

export function ActiveLetterModal({
  student,
  onClose,
}: {
  student: StudentDetail
  onClose: () => void
}) {
  const [isPending, setIsPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<ActiveLetterForm>({
    initialValues: { subject: DEFAULT_SUBJECT, purpose: "" },
    validate: schemaResolver(activeLetterFormSchema, { sync: true }),
  })

  const submit = form.onSubmit(async (values) => {
    setIsPending(true)
    setFormError(null)
    try {
      await openRenderedFile(
        `/print/students/${encodeURIComponent(student.nis)}/active-letter`,
        values,
      )
      notify.success(`Surat Keterangan ${student.name} dicetak dengan nomor baru.`)
      onClose()
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
      if (error.details.length > 0) {
        form.setErrors(Object.fromEntries(error.details.map((d) => [d.field, d.message])))
      } else {
        setFormError(error.message)
      }
    } finally {
      setIsPending(false)
    }
  })

  return (
    <FormModal
      title={`Cetak Surat Keterangan ${student.name}`}
      submitLabel="Cetak PDF"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <p className="body-sm text-muted">
        Nomor surat diberikan sistem dan setiap cetakan mengambil nomor berikutnya.
      </p>
      <TextInput label="Perihal" withAsterisk {...form.getInputProps("subject")} />
      <TextInput
        label="Keperluan"
        placeholder="Contoh: persyaratan administrasi KP4"
        withAsterisk
        data-autofocus
        {...form.getInputProps("purpose")}
      />
    </FormModal>
  )
}
