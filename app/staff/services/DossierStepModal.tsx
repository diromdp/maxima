"use client"

import { Modal, Textarea } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { saveDossierStep } from "@/src/entities/service/actions"
import {
  blankToNull,
  DOSSIER,
  type DossierStep,
  RESULT_TYPES,
  type ServiceDetail,
  type StepForm,
  stepFormSchema,
} from "@/src/entities/service/schema"
import { failureOf } from "@/src/lib/api/errors"
import { useActionForm } from "@/src/lib/use-action-form"

import { ResultFileField, uploadServiceResult } from "./ResultFileField"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }
const RESULT_TYPE_REQUIRED = "Pilih jenis berkas hasilnya."

export function DossierStepModal({
  detail,
  step,
  onClose,
}: {
  detail: ServiceDetail
  step: DossierStep
  onClose: () => void
}) {
  const resultTypes = RESULT_TYPES[DOSSIER] ?? []
  const [documentType, setDocumentType] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const form = useForm<StepForm>({
    initialValues: {
      startedOn: step.startedOn ?? "",
      finishedOn: step.finishedOn ?? "",
      note: step.note ?? "",
    },
    validate: schemaResolver(stepFormSchema, { sync: true }),
  })

  const { submit, isPending, formError } = useActionForm({
    form,
    action: async (values) => {
      if (file) {
        if (!documentType) {
          setFileError(RESULT_TYPE_REQUIRED)
          return failureOf<null>(RESULT_TYPE_REQUIRED)
        }
        const uploaded = await uploadServiceResult(detail, DOSSIER, { documentType, file })
        if (!uploaded.ok) return uploaded
      }
      return saveDossierStep(detail.student.nis, step.step, {
        startedOn: values.startedOn || null,
        finishedOn: values.finishedOn || null,
        note: blankToNull(values.note),
      })
    },
    successMessage: `Langkah ${step.name} ${detail.student.name} tersimpan.`,
    invalidates: [["services", detail.student.nis], ["services-board"]],
    onSuccess: onClose,
  })

  return (
    <Modal
      opened
      onClose={onClose}
      title={`Ubah Langkah ${step.name}`}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form className="stack stack-lg" onSubmit={submit} noValidate>
        <Notice tone="info">
          Langkah ini rincian progres Pemberkasan, bukan layanan tersendiri. Mengisi Tanggal Mulai
          langkah mana pun menandai Pemberkasan Dikerjakan; Pemberkasan Selesai lewat Tanggal
          Selesai di tombol Ubah barisnya.
        </Notice>
        {formError && <Notice tone="danger">{formError}</Notice>}

        <DatesProvider settings={{ locale: "id" }}>
          <div className="grid-2">
            <DateInput
              label="Tanggal Mulai"
              placeholder="Pilih tanggal"
              valueFormat="DD MMM YYYY"
              clearable
              data-autofocus
              value={form.values.startedOn || null}
              error={form.errors.startedOn}
              onChange={(value) => form.setFieldValue("startedOn", value ?? "")}
            />
            <DateInput
              label="Tanggal Selesai"
              placeholder="Kosongkan bila masih berjalan"
              valueFormat="DD MMM YYYY"
              clearable
              value={form.values.finishedOn || null}
              error={form.errors.finishedOn}
              onChange={(value) => form.setFieldValue("finishedOn", value ?? "")}
            />
          </div>
        </DatesProvider>

        <Textarea
          label="Catatan"
          placeholder="Contoh: Apostille dalam proses"
          autosize
          minRows={2}
          {...form.getInputProps("note")}
        />

        <ResultFileField
          types={resultTypes}
          documentType={documentType}
          file={file}
          error={fileError}
          onTypeChange={(value) => {
            setDocumentType(value)
            setFileError(null)
          }}
          onFileChange={setFile}
          onError={setFileError}
        />

        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Langkah"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
