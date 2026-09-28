"use client"

import { Modal, Select } from "@mantine/core"
import { Dropzone } from "@mantine/dropzone"
import { schemaResolver, useForm } from "@mantine/form"
import { useDebouncedValue } from "@mantine/hooks"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { Notice } from "@/src/components/ui/Notice"
import { createCertificate, presignCertificateFile } from "@/src/entities/certificate/actions"
import { certificateStudentsQuery } from "@/src/entities/certificate/queries"
import {
  certificateFormSchema,
  EMPTY_MODULES,
  modulesInputOf,
  type CertificateForm,
  type StudentOption,
} from "@/src/entities/certificate/schema"
import { failureOf } from "@/src/lib/api/errors"
import { readApi } from "@/src/lib/api/read"
import {
  isUploadable,
  putToStorage,
  UPLOAD_ACCEPT,
  UPLOAD_FAILED,
  UPLOAD_RULE,
} from "@/src/lib/upload"
import { useActionForm } from "@/src/lib/use-action-form"

import { ModuleFields } from "./ModuleFields"
import { useExamOptions } from "./use-exam-options"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }
const MIN_SEARCH = 2
const SEARCH_DELAY_MS = 300
const FILE_REQUIRED = "Unggah berkas sertifikatnya."

export function CertificateFormModal({ onClose }: { onClose: () => void }) {
  const { levels, kinds } = useExamOptions()
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebouncedValue(search.trim(), SEARCH_DELAY_MS)
  const [student, setStudent] = useState<StudentOption | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const studentRead = certificateStudentsQuery(debouncedSearch)
  const students = useQuery({
    queryKey: studentRead.queryKey,
    queryFn: () => readApi(studentRead),
    enabled: debouncedSearch.length >= MIN_SEARCH,
  })
  const options = [
    ...(student ? [student] : []),
    ...(students.data?.data ?? []).filter((option) => option.id !== student?.id),
  ]

  const form = useForm<CertificateForm>({
    initialValues: { studentId: "", kindId: "", levelId: "", modules: EMPTY_MODULES },
    validate: schemaResolver(certificateFormSchema, { sync: true }),
  })

  const { submit, isPending, formError } = useActionForm({
    form,
    action: async (values) => {
      if (!file) return failureOf<null>(FILE_REQUIRED)
      const kind = kinds.find((option) => option.value === values.kindId)
      const level = levels.find((option) => option.value === values.levelId)
      const target = await presignCertificateFile(
        values.studentId,
        kind?.code ?? "",
        level?.code ?? "",
        { mimeType: file.type, sizeBytes: file.size },
      )
      if (!target.ok) return target
      if (!(await putToStorage(target.data, file))) return failureOf<null>(UPLOAD_FAILED)
      const saved = await createCertificate({
        studentId: values.studentId,
        kindId: values.kindId,
        levelId: values.levelId,
        modules: modulesInputOf(values.modules),
      })
      return saved.ok ? { ok: true as const, data: null } : saved
    },
    successMessage: "Data sertifikat disimpan dan langsung terverifikasi.",
    invalidates: [["certificates"]],
    onSuccess: onClose,
  })

  function pickFile(files: File[]) {
    const picked = files[0]
    if (!picked) return
    if (!isUploadable(picked)) {
      setFileError(UPLOAD_RULE)
      return
    }
    setFileError(null)
    setFile(picked)
  }

  return (
    <Modal opened onClose={onClose} title="Tambah Data Sertifikat" size="lg" styles={TITLE_STYLE}>
      <form
        className="stack stack-lg"
        noValidate
        onSubmit={(event) => {
          if (!file) setFileError(FILE_REQUIRED)
          submit(event)
        }}
      >
        <Notice tone="info">
          Isi nilai persis seperti di berkas sertifikat. Data dari sini langsung Terverifikasi dan
          menggantikan sertifikat jenis dan level yang sama milik siswa itu. Usulan siswa dari
          portal berstatus menunggu sampai dicocokkan di tab ini.
        </Notice>
        {formError && <Notice tone="danger">{formError}</Notice>}

        <Select
          label="Nama Siswa"
          placeholder="Ketik minimal dua huruf nama atau NIS"
          withAsterisk
          searchable
          data-autofocus
          searchValue={search}
          onSearchChange={setSearch}
          filter={({ options: all }) => all}
          nothingFoundMessage={
            debouncedSearch.length < MIN_SEARCH
              ? "Ketik minimal dua huruf nama atau NIS."
              : students.isFetching
                ? "Mencari..."
                : students.isError
                  ? students.error.message
                  : "Tidak ada siswa ber-NIS yang cocok dalam cakupanmu."
          }
          data={options.map((option) => ({
            value: option.id,
            label: `${option.name} · ${option.nis}`,
          }))}
          value={form.values.studentId || null}
          error={form.errors.studentId}
          onChange={(value) => {
            setStudent(options.find((option) => option.id === value) ?? null)
            form.setFieldValue("studentId", value ?? "")
          }}
        />

        <div className="grid-2">
          <Select
            label="Jenis"
            placeholder="Pilih jenis"
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

        <ModuleFields
          modules={form.values.modules}
          errors={form.errors}
          onChange={(modules) => form.setFieldValue("modules", modules)}
        />

        <div className="stack stack-sm">
          <span className="field-label">Berkas sertifikat</span>
          {file ? (
            <div className="row row-between row-soft">
              <span className="body-sm">{file.name}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFile(null)}>
                Ganti
              </button>
            </div>
          ) : (
            <Dropzone
              onDrop={pickFile}
              onReject={() => setFileError(UPLOAD_RULE)}
              maxFiles={1}
              multiple={false}
              accept={UPLOAD_ACCEPT.split(",")}
            >
              <DropzoneBody rule={`${UPLOAD_RULE} Berkas menempel pada data sertifikat ini.`} />
            </Dropzone>
          )}
          {fileError && <span className="field-error">{fileError}</span>}
        </div>

        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Sertifikat"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
