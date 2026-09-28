"use client"

import { Dropzone } from "@mantine/dropzone"
import { useForm } from "@mantine/form"
import { useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { FormModal } from "@/src/components/ui/FormModal"
import { Notice } from "@/src/components/ui/Notice"
import { presignStudentDocument, uploadStudentDocument } from "@/src/entities/document/actions"
import { documentKeysOf } from "@/src/entities/document/queries"
import type { DocumentDetail, DocumentItem } from "@/src/entities/document/schema"
import { presignServiceResult, registerServiceResult } from "@/src/entities/service/actions"
import { serviceOfResult } from "@/src/entities/service/schema"
import { failureOf } from "@/src/lib/api/errors"
import { formatFileSize } from "@/src/lib/format"
import {
  INTRODUCTION_VIDEO,
  putToStorage,
  UPLOAD_FAILED,
  UPLOAD_MAX_BYTES,
  UPLOAD_TYPES,
  VIDEO_UPLOAD_MAX_BYTES,
  VIDEO_UPLOAD_TYPES,
} from "@/src/lib/upload"
import { useActionForm } from "@/src/lib/use-action-form"

const RULES = {
  document: { max: UPLOAD_MAX_BYTES, accept: [...UPLOAD_TYPES], label: "PDF, JPG, atau PNG" },
  video: { max: VIDEO_UPLOAD_MAX_BYTES, accept: [...VIDEO_UPLOAD_TYPES], label: "MP4 atau WebM" },
}

const FILE_REQUIRED = "Pilih berkasnya dulu."

export function StaffUploadModal({
  student,
  item,
  onClose,
}: {
  student: DocumentDetail["summary"]
  item: DocumentItem
  onClose: () => void
}) {
  const code = item.code ?? ""
  const rule = code === INTRODUCTION_VIDEO ? RULES.video : RULES.document
  const ruleText = `Format ${rule.label}, maksimal ${formatFileSize(rule.max)}.`
  const isReplacing = item.objectKey !== null
  const serviceCode = serviceOfResult(code)
  const [picked, setPicked] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)

  const form = useForm({ initialValues: {} })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: async () => {
      if (!picked) return failureOf<null>(FILE_REQUIRED)
      const file = { mimeType: picked.type, sizeBytes: picked.size }
      const target = serviceCode
        ? await presignServiceResult(student.studentId, code, file)
        : await presignStudentDocument(student.studentId, code, file)
      if (!target.ok) return target
      const isStored = await putToStorage(target.data, picked, setProgress)
      setProgress(null)
      if (!isStored) return failureOf<null>(UPLOAD_FAILED)
      const saved = serviceCode
        ? await registerServiceResult(student.nis, serviceCode, {
            documentType: code,
            originalName: picked.name,
          })
        : await uploadStudentDocument(student.nis, code, picked.name)
      return saved.ok ? { ok: true as const, data: null } : saved
    },
    successMessage: `${item.name} milik ${student.name} tersimpan dan berstatus Lengkap.`,
    invalidates: [
      ...documentKeysOf(student.nis),
      ["visa-placements"],
      ["services", student.nis],
      ["services-board"],
    ],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title={`${isReplacing ? "Ganti" : "Unggah"} ${item.name}`}
      size="lg"
      submitLabel={isReplacing ? "Ganti Berkas" : "Unggah Berkas"}
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <Notice tone="info">
        {item.producer === "student"
          ? `Pakai ini bila ${student.name} tidak dapat mengunggah sendiri dari portal. `
          : ""}
        Berkas yang Admission unggah langsung berstatus Lengkap dan tampil di portal milik siswa.
        {serviceCode ? " Berkas ini juga tampil di kolom Hasil halaman Layanan." : ""}
      </Notice>
      {isReplacing && (
        <Notice tone="warning">
          Berkas saat ini: {item.originalName ?? item.name}. Berkas baru menggantikannya.
        </Notice>
      )}
      <div className="stack stack-sm">
        <Dropzone
          onDrop={(files) => {
            setFileError(null)
            setPicked(files[0] ?? null)
          }}
          onReject={() => setFileError(`Berkas ditolak. ${ruleText}`)}
          maxSize={rule.max}
          maxFiles={1}
          multiple={false}
          accept={rule.accept}
        >
          <DropzoneBody
            prompt={picked ? `${picked.name} · ${formatFileSize(picked.size)}` : undefined}
            rule={ruleText}
            progress={progress}
          />
        </Dropzone>
        {fileError && <span className="field-error">{fileError}</span>}
      </div>
    </FormModal>
  )
}
