"use client"

import { Modal, Select, Textarea, TextInput } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { schemaResolver, useForm } from "@mantine/form"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { saveServiceWork } from "@/src/entities/service/actions"
import { serviceOptionsQuery } from "@/src/entities/service/queries"
import {
  blankToNull,
  PASSPORT,
  RESULT_TYPES,
  type ServiceDetail,
  type ServiceRow,
  type WorkForm,
  workFormSchema,
} from "@/src/entities/service/schema"
import { useRead } from "@/src/lib/api/use-read"
import { useActionForm } from "@/src/lib/use-action-form"

import { ResultFileField, uploadServiceResult } from "./ResultFileField"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function ServiceWorkModal({
  detail,
  row,
  onClose,
}: {
  detail: ServiceDetail
  row: ServiceRow
  onClose: () => void
}) {
  const options = useRead(serviceOptionsQuery())
  const resultTypes = row.code === PASSPORT ? (RESULT_TYPES[PASSPORT] ?? []) : []
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const form = useForm<WorkForm>({
    initialValues: {
      picUserId: row.pic?.id ?? "",
      progressNote: row.progressNote ?? "",
      startedOn: row.startedOn ?? "",
      finishedOn: row.finishedOn ?? "",
      note: row.note ?? "",
    },
    validate: schemaResolver(workFormSchema, { sync: true }),
  })

  const { submit, isPending, formError } = useActionForm({
    form,
    action: async (values) => {
      const documentType = resultTypes[0]?.id
      if (file && documentType) {
        const uploaded = await uploadServiceResult(detail, row.code, { documentType, file })
        if (!uploaded.ok) return uploaded
      }
      return saveServiceWork(detail.student.nis, row.code, {
        picUserId: values.picUserId,
        progressNote: blankToNull(values.progressNote),
        startedOn: values.startedOn || null,
        finishedOn: values.finishedOn || null,
        note: blankToNull(values.note),
        lastUpdatedAt: row.updatedAt,
      })
    },
    successMessage: `Pengerjaan ${row.name} ${detail.student.name} tersimpan.`,
    invalidates: [["services", detail.student.nis], ["services-board"]],
    onSuccess: onClose,
  })

  const pics = [
    ...(row.pic && !options.data?.pics.some((pic) => pic.id === row.pic?.id) ? [row.pic] : []),
    ...(options.data?.pics ?? []),
  ]

  return (
    <Modal
      opened
      onClose={onClose}
      title={`Ubah Layanan ${row.name}`}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form className="stack stack-lg" onSubmit={submit} noValidate>
        <Notice tone="info">
          Status gerbang {detail.student.name} untuk {row.name} tetap {row.status}, dihitung dari
          pembayaran. Yang diubah di sini hanya pengerjaannya; mengisi Tanggal Selesai menandai
          layanan Selesai.
        </Notice>
        {formError && <Notice tone="danger">{formError}</Notice>}

        <div className="grid-2">
          <Select
            label="PIC"
            placeholder={options.isPending ? "Memuat staf..." : "Pilih PIC"}
            withAsterisk
            searchable
            data-autofocus
            data={pics.map((pic) => ({ value: pic.id, label: pic.name }))}
            {...form.getInputProps("picUserId")}
            error={form.errors.picUserId ?? (options.isError ? options.error.message : undefined)}
          />
          <TextInput
            label="Progres / Aksi yang Perlu"
            placeholder="Contoh: Menunggu jadwal Goethe"
            {...form.getInputProps("progressNote")}
          />
        </div>

        <DatesProvider settings={{ locale: "id" }}>
          <div className="grid-2">
            <DateInput
              label="Tanggal Mulai"
              placeholder="Pilih tanggal"
              valueFormat="DD MMM YYYY"
              clearable
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
          placeholder="Contoh: Rencana Goethe Desember 2026"
          autosize
          minRows={2}
          {...form.getInputProps("note")}
        />

        {resultTypes.length > 0 && (
          <ResultFileField
            types={resultTypes}
            documentType={resultTypes[0]?.id ?? null}
            file={file}
            error={fileError}
            onTypeChange={() => undefined}
            onFileChange={setFile}
            onError={setFileError}
          />
        )}

        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Layanan"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
