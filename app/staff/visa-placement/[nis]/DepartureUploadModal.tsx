"use client"

import { Modal } from "@mantine/core"
import { Dropzone } from "@mantine/dropzone"
import { useForm } from "@mantine/form"
import { useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { Notice } from "@/src/components/ui/Notice"
import { presignDepartureFile, registerDepartureFile } from "@/src/entities/placement/actions"
import type { DepartureFile, PlacementDetail } from "@/src/entities/placement/schema"
import { failureOf } from "@/src/lib/api/errors"
import { formatFileSize } from "@/src/lib/format"
import {
  isUploadable,
  putToStorage,
  UPLOAD_ACCEPT,
  UPLOAD_FAILED,
  UPLOAD_RULE,
} from "@/src/lib/upload"
import { useActionForm } from "@/src/lib/use-action-form"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }
const FILE_REQUIRED = "Pilih berkasnya dulu."

export function DepartureUploadModal({
  detail,
  file,
  onClose,
}: {
  detail: PlacementDetail
  file: DepartureFile
  onClose: () => void
}) {
  const [picked, setPicked] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const current = file.documents.find((document) => document.objectKey)
  const code = file.documents[0]?.code
  const verb = current ? "Ganti" : "Unggah"

  const form = useForm({ initialValues: {} })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: async () => {
      if (!picked || !code) return failureOf<null>(FILE_REQUIRED)
      const target = await presignDepartureFile(detail.student.id, code, {
        mimeType: picked.type,
        sizeBytes: picked.size,
      })
      if (!target.ok) return target
      if (!(await putToStorage(target.data, picked))) return failureOf<null>(UPLOAD_FAILED)
      const saved = await registerDepartureFile(detail.student.nis, code, picked.name)
      return saved.ok ? { ok: true as const, data: null } : saved
    },
    successMessage: `${file.label} tersimpan dan berstatus Lengkap di halaman Dokumen.`,
    invalidates: [["visa-placements"], ["documents"]],
    onSuccess: onClose,
  })

  function pick(files: File[]) {
    const next = files[0]
    if (!next) return
    if (!isUploadable(next)) {
      setFileError(UPLOAD_RULE)
      return
    }
    setFileError(null)
    setPicked(next)
  }

  return (
    <Modal opened onClose={onClose} title={`${verb} ${file.label}`} size="lg" styles={TITLE_STYLE}>
      <form className="stack stack-lg" onSubmit={submit} noValidate>
        <Notice tone="info">
          Berkas ini masuk ke rumpun Dari Betrieb di halaman Dokumen milik {detail.student.name} dan
          langsung berstatus Lengkap, tanpa menunggu verifikasi.
        </Notice>
        {current && (
          <Notice tone="warning">
            Berkas saat ini: {current.originalName ?? current.name}. Berkas baru menggantikannya,
            dan siswa melihat berkas yang baru di portalnya.
          </Notice>
        )}
        {formError && <Notice tone="danger">{formError}</Notice>}

        <div className="stack stack-sm">
          <Dropzone
            onDrop={pick}
            onReject={() => setFileError(UPLOAD_RULE)}
            maxFiles={1}
            multiple={false}
            accept={UPLOAD_ACCEPT.split(",")}
          >
            <DropzoneBody
              prompt={picked ? `${picked.name} · ${formatFileSize(picked.size)}` : undefined}
              rule={UPLOAD_RULE}
            />
          </Dropzone>
          {fileError && <span className="field-error">{fileError}</span>}
        </div>

        <div className="row row-wrap" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary" disabled={!picked || isPending}>
            {isPending ? "Mengunggah..." : current ? "Ganti Berkas" : "Unggah Berkas"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
