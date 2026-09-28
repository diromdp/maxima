"use client"

import { Select } from "@mantine/core"
import { Dropzone } from "@mantine/dropzone"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { presignServiceResult, registerServiceResult } from "@/src/entities/service/actions"
import type { ServiceDetail } from "@/src/entities/service/schema"
import { type ActionResult, failureOf } from "@/src/lib/api/errors"
import { formatFileSize } from "@/src/lib/format"
import {
  isUploadable,
  putToStorage,
  UPLOAD_ACCEPT,
  UPLOAD_FAILED,
  UPLOAD_RULE,
} from "@/src/lib/upload"

export type ResultFile = { documentType: string; file: File } | null

export async function uploadServiceResult(
  detail: ServiceDetail,
  code: string,
  result: NonNullable<ResultFile>,
): Promise<ActionResult<null>> {
  const target = await presignServiceResult(detail.student.id, result.documentType, {
    mimeType: result.file.type,
    sizeBytes: result.file.size,
  })
  if (!target.ok) return target
  if (!(await putToStorage(target.data, result.file))) return failureOf(UPLOAD_FAILED)
  const saved = await registerServiceResult(detail.student.nis, code, {
    documentType: result.documentType,
    originalName: result.file.name,
  })
  return saved.ok ? { ok: true, data: null } : saved
}

export function ResultFileField({
  types,
  documentType,
  file,
  error,
  onTypeChange,
  onFileChange,
  onError,
}: {
  types: readonly { id: string; name: string }[]
  documentType: string | null
  file: File | null
  error: string | null
  onTypeChange: (documentType: string | null) => void
  onFileChange: (file: File | null) => void
  onError: (message: string | null) => void
}) {
  function pick(files: File[]) {
    const picked = files[0]
    if (!picked) return
    if (!isUploadable(picked)) {
      onError(UPLOAD_RULE)
      return
    }
    onError(null)
    onFileChange(picked)
  }

  return (
    <div className="stack stack-sm">
      <span className="field-label">Hasil</span>
      {types.length > 1 && (
        <Select
          aria-label="Jenis berkas hasil"
          placeholder="Pilih jenis berkas hasil"
          data={types.map((type) => ({ value: type.id, label: type.name }))}
          value={documentType}
          onChange={onTypeChange}
          clearable
        />
      )}
      {file ? (
        <div className="row row-between row-soft">
          <div className="stack" style={{ gap: 0 }}>
            <span className="body-sm">{file.name}</span>
            <span className="caption text-muted tabular">{formatFileSize(file.size)}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onFileChange(null)}>
            Ganti
          </button>
        </div>
      ) : (
        <Dropzone
          onDrop={pick}
          onReject={() => onError(UPLOAD_RULE)}
          maxFiles={1}
          multiple={false}
          accept={UPLOAD_ACCEPT.split(",")}
        >
          <DropzoneBody
            rule={`${UPLOAD_RULE} Berkas hasil tampil di rumpun Hasil Layanan siswa dan sebagai unduhan di portal.`}
          />
        </Dropzone>
      )}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
