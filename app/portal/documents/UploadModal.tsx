"use client"

import { Group, Image, Modal, Stack, Text } from "@mantine/core"
import { Dropzone } from "@mantine/dropzone"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { Notice } from "@/src/components/ui/Notice"
import { confirmOwnDocument, presignOwnDocument } from "@/src/entities/document/own-actions"
import type { DocumentDetail, DocumentItem } from "@/src/entities/document/schema"
import { failureOf, type ActionResult } from "@/src/lib/api/errors"
import { formatFileSize } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"
import {
  INTRODUCTION_VIDEO,
  putToStorage,
  UPLOAD_FAILED,
  UPLOAD_MAX_BYTES,
  UPLOAD_TYPES,
  VIDEO_UPLOAD_MAX_BYTES,
  VIDEO_UPLOAD_TYPES,
} from "@/src/lib/upload"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

const RULES = {
  document: { max: UPLOAD_MAX_BYTES, accept: [...UPLOAD_TYPES], label: "PDF, JPG, atau PNG" },
  video: { max: VIDEO_UPLOAD_MAX_BYTES, accept: [...VIDEO_UPLOAD_TYPES], label: "MP4 atau WebM" },
} as const

async function uploadOwn(
  code: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<ActionResult<DocumentDetail>> {
  const target = await presignOwnDocument(code, { mimeType: file.type, sizeBytes: file.size })
  if (!target.ok) return target
  if (!(await putToStorage(target.data, file, onProgress))) return failureOf(UPLOAD_FAILED)
  return confirmOwnDocument(code, file.name)
}

export function UploadModal({ item, onClose }: { item: DocumentItem; onClose: () => void }) {
  const code = item.code ?? ""
  const isVideo = code === INTRODUCTION_VIDEO
  const rule = isVideo ? RULES.video : RULES.document
  const isReplacing = item.state !== "Belum Diunggah"
  const isVerified = item.state === "Lengkap"
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const upload = useMutation({
    mutationFn: (picked: File) => uploadOwn(code, picked, setProgress),
    onSettled: () => setProgress(null),
    onSuccess: (result) => {
      if (!result.ok) {
        setError(result.message)
        return
      }
      queryClient.setQueryData(["own-documents"], result.data)
      notify.success(`${item.name} terkirim. Menunggu verifikasi Admission.`)
      onClose()
    },
  })

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  return (
    <Modal
      opened
      onClose={onClose}
      title={`${isReplacing ? "Ganti" : "Unggah"} ${item.name}`}
      size="lg"
      styles={TITLE_STYLE}
    >
      <Stack gap="lg">
        <Text size="sm" c="dimmed">
          {isVideo
            ? "Rekam diri Anda memperkenalkan diri dalam bahasa Jerman, 1 sampai 3 menit. "
            : "Unggah berkas asli yang dipindai, bukan tautan Drive. "}
          Format {rule.label}, maksimal {formatFileSize(rule.max)}.
        </Text>

        {isReplacing && (
          <Notice tone={isVerified ? "warning" : "info"}>
            {item.originalName ? `Berkas saat ini: ${item.originalName}. ` : ""}
            {isVerified
              ? `${item.name} sudah terverifikasi. Menggantinya mengembalikan statusnya ke Menunggu sampai Admission memeriksa berkas baru.`
              : "Berkas baru menggantikan yang lama."}
          </Notice>
        )}

        {error && <Notice tone="danger">{error}</Notice>}

        <Dropzone
          onDrop={(files) => {
            setError(null)
            setFile(files[0] ?? null)
          }}
          onReject={() =>
            setError(`Berkas ditolak. Format ${rule.label}, maksimal ${formatFileSize(rule.max)}.`)
          }
          maxSize={rule.max}
          maxFiles={1}
          multiple={false}
          accept={[...rule.accept]}
        >
          <DropzoneBody
            prompt={file ? `${file.name} · ${formatFileSize(file.size)}` : undefined}
            rule={`Format ${rule.label}, maksimal ${formatFileSize(rule.max)}.`}
            progress={progress}
          />
        </Dropzone>

        {previewUrl && file && (
          <div className="stack stack-sm">
            <span className="field-label">Pratinjau</span>
            {isVideo ? (
              <video
                controls
                preload="metadata"
                src={previewUrl}
                style={{
                  width: "100%",
                  maxHeight: 360,
                  borderRadius: 16,
                  backgroundColor: "var(--ink)",
                }}
              />
            ) : file.type.startsWith("image/") ? (
              <Image
                alt={`Pratinjau ${item.name}`}
                src={previewUrl}
                mah={420}
                fit="contain"
                radius={16}
              />
            ) : (
              <iframe
                title={`Pratinjau ${item.name}`}
                src={previewUrl}
                style={{
                  width: "100%",
                  height: 420,
                  border: 0,
                  borderRadius: 16,
                  backgroundColor: "var(--canvas-soft)",
                }}
              />
            )}
          </div>
        )}

        <Group justify="flex-end">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className={`btn ${isVerified ? "btn-danger" : "btn-primary"}`}
            disabled={!file || upload.isPending}
            title={file ? undefined : "Pilih berkas dulu"}
            onClick={() => file && upload.mutate(file)}
          >
            {upload.isPending ? "Mengunggah..." : isReplacing ? "Ganti Berkas" : "Kirim"}
          </button>
        </Group>
      </Stack>
    </Modal>
  )
}
