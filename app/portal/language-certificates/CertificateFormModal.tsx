"use client"

import { Modal, NumberInput, Select, Stack, Text } from "@mantine/core"
import { MonthPickerInput } from "@mantine/dates"
import { Dropzone, MIME_TYPES } from "@mantine/dropzone"
import { schemaResolver, useForm } from "@mantine/form"
import dayjs from "dayjs"
import { useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { Notice } from "@/src/components/ui/Notice"
import {
  presignOwnCertificateFile,
  proposeCertificate,
} from "@/src/entities/certificate/own-actions"
import { ownCertificateOptionsQuery } from "@/src/entities/certificate/queries"
import {
  EMPTY_MODULES,
  MODULE_KEYS,
  MODULE_LABEL,
  modulesFormOf,
  modulesInputOf,
  ownCertificateFormSchema,
  type CertificateRow,
  type ModuleKey,
  type OwnCertificateForm,
} from "@/src/entities/certificate/schema"
import { failureOf } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import { formatFileSize } from "@/src/lib/format"
import { putToStorage, UPLOAD_FAILED, UPLOAD_MAX_BYTES } from "@/src/lib/upload"
import { useActionForm } from "@/src/lib/use-action-form"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }
const FILE_RULE = `PDF. Maksimal ${formatFileSize(UPLOAD_MAX_BYTES)}.`
const FILE_REQUIRED = "Unggah berkas sertifikatnya."
const FILE_REJECTED = "Berkas ditolak. Format PDF, maksimal 5 MB."

export function CertificateFormModal({
  initial,
  onClose,
}: {
  initial?: CertificateRow
  onClose: () => void
}) {
  const options = useRead(ownCertificateOptionsQuery())
  const kinds = options.data?.kinds ?? []
  const levels = options.data?.levels ?? []
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const needsFile = !initial?.hasFile

  const form = useForm<OwnCertificateForm>({
    initialValues: {
      kindId: initial?.kind.id ?? "",
      levelId: initial?.level.id ?? "",
      modules: initial ? modulesFormOf(initial.modules) : EMPTY_MODULES,
    },
    validate: schemaResolver(ownCertificateFormSchema, { sync: true }),
  })

  const { submit, isPending, formError } = useActionForm({
    form,
    action: async (values) => {
      if (file) {
        const kind = kinds.find((option) => option.id === values.kindId)
        const level = levels.find((option) => option.id === values.levelId)
        const target = await presignOwnCertificateFile(kind?.code ?? "", level?.code ?? "", {
          mimeType: file.type,
          sizeBytes: file.size,
        })
        if (!target.ok) return target
        if (!(await putToStorage(target.data, file))) return failureOf<null>(UPLOAD_FAILED)
      } else if (needsFile) {
        return failureOf<null>(FILE_REQUIRED)
      }
      const saved = await proposeCertificate({
        kindId: values.kindId,
        levelId: values.levelId,
        modules: modulesInputOf(values.modules),
      })
      return saved.ok ? { ok: true as const, data: null } : saved
    },
    successMessage: initial
      ? "Perubahan dikirim. Statusnya Menunggu sampai Admin memverifikasi."
      : "Sertifikat dikirim. Statusnya Menunggu sampai Admin memverifikasi.",
    invalidates: [["own-certificates"]],
    onSuccess: onClose,
  })

  const updateModule = (
    key: ModuleKey,
    change: Partial<OwnCertificateForm["modules"][ModuleKey]>,
  ) =>
    form.setFieldValue("modules", {
      ...form.values.modules,
      [key]: { ...form.values.modules[key], ...change },
    })

  function pickFile(files: File[]) {
    const picked = files[0]
    if (!picked) return
    setFileError(null)
    setFile(picked)
  }

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        initial
          ? `Ubah Sertifikat ${initial.kind.name} ${initial.level.name}`
          : "Tambah Sertifikat Baru"
      }
      size="xl"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        noValidate
        onSubmit={(event) => {
          if (needsFile && !file) setFileError(FILE_REQUIRED)
          submit(event)
        }}
      >
        {formError && <Notice tone="danger">{formError}</Notice>}
        {options.isError && <Notice tone="danger">{options.error.message}</Notice>}

        <div className="grid-2">
          <Select
            label="Jenis Sertifikat"
            placeholder="Pilih jenis"
            withAsterisk
            disabled={initial !== undefined}
            data={kinds.map((kind) => ({ value: kind.id, label: kind.name }))}
            {...form.getInputProps("kindId")}
          />
          <Select
            label="Tingkat / Level"
            placeholder="Pilih level"
            withAsterisk
            disabled={initial !== undefined}
            data={levels.map((level) => ({ value: level.id, label: level.name }))}
            {...form.getInputProps("levelId")}
          />
        </div>

        <div className="grid-4">
          {MODULE_KEYS.map((key) => (
            <NumberInput
              key={key}
              label={`Nilai ${MODULE_LABEL[key]}`}
              placeholder="0 sampai 100"
              min={0}
              max={100}
              clampBehavior="strict"
              allowDecimal={false}
              hideControls
              value={form.values.modules[key].score}
              error={form.errors[`modules.${key}.score`]}
              onChange={(value) => updateModule(key, { score: value === "" ? "" : Number(value) })}
            />
          ))}
        </div>

        <div className="grid-4">
          {MODULE_KEYS.map((key) => (
            <MonthPickerInput
              key={key}
              label={`${MODULE_LABEL[key]} Expired`}
              placeholder="Pilih bulan"
              valueFormat="MM/YYYY"
              clearable
              value={form.values.modules[key].validUntil || null}
              error={form.errors[`modules.${key}.validUntil`]}
              onChange={(value) =>
                updateModule(key, {
                  validUntil: value ? dayjs(value).endOf("month").format("YYYY-MM-DD") : "",
                })
              }
            />
          ))}
        </div>

        <Stack gap="xs">
          <Text className="field-label" component="span">
            Upload Sertifikat
          </Text>
          <Text className="field-hint" component="span">
            {needsFile
              ? "Jika terpisah, gabungkan dalam 1 PDF (maks 5 MB)"
              : "Berkas lama tetap dipakai. Unggah hanya kalau ingin menggantinya (PDF, maks 5 MB)."}
          </Text>
          <Dropzone
            onDrop={pickFile}
            onReject={() => setFileError(FILE_REJECTED)}
            maxSize={UPLOAD_MAX_BYTES}
            maxFiles={1}
            multiple={false}
            accept={[MIME_TYPES.pdf]}
          >
            <DropzoneBody
              prompt={file ? `${file.name} · ${formatFileSize(file.size)}` : undefined}
              rule={FILE_RULE}
            />
          </Dropzone>
          {fileError && <span className="field-error">{fileError}</span>}
        </Stack>

        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Simpan Sertifikat"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
