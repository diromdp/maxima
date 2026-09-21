"use client"

import { useEffect, useMemo, useState } from "react"
import { Group, Modal, Stack, Text } from "@mantine/core"
import { Dropzone, MIME_TYPES } from "@mantine/dropzone"
import { notify } from "@/src/lib/notify"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { formatFileSize } from "@/src/lib/format"
import { Notice } from "@/src/components/ui/Notice"

type Kind = "pdf" | "video"

// ponytail: batas video tidak ada di PRD; 100 MB cukup untuk 2-3 menit 1080p.
// Naikkan atau turunkan begitu Admission menetapkan angkanya.
const RULES: Readonly<Record<Kind, { max: number; accept: string[]; label: string }>> = {
  pdf: { max: 5 * 1024 * 1024, accept: [MIME_TYPES.pdf], label: "PDF" },
  video: { max: 100 * 1024 * 1024, accept: [MIME_TYPES.mp4, "video/webm"], label: "MP4 atau WebM" },
}

/**
 * Satu modal untuk Unggah dan Ganti: area seret-lepas, pratinjau berkas yang
 * terpilih (PDF lewat iframe, video lewat `<video>`), lalu Kirim. Mengganti
 * berkas yang sudah terverifikasi mengembalikan statusnya ke Menunggu —
 * peringatannya ditulis di dalam modal, dan tombolnya menyebut "Ganti".
 */
export function UploadModal({
  name,
  kind = "pdf",
  replace = false,
  verified = false,
  currentFile,
}: {
  name: string
  kind?: Kind
  replace?: boolean
  verified?: boolean
  /** Nama berkas yang sedang tersimpan, ditampilkan saat mengganti. */
  currentFile?: string
}) {
  const rule = RULES[kind]
  const [opened, setOpened] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  // URL objek diturunkan dari berkas; dicabut saat berkas berganti atau modal ditutup.
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function close() {
    setOpened(false)
    setFile(null)
  }

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpened(true)}>
        {replace ? "Ganti" : "Unggah"}
      </button>

      <Modal
        opened={opened}
        onClose={close}
        title={`${replace ? "Ganti" : "Unggah"} ${name}`}
        size="lg"
        styles={{ title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }}
      >
        <Stack gap="lg">
          <Text size="sm" c="dimmed">
            {kind === "video"
              ? "Rekam diri Anda memperkenalkan diri dalam bahasa Jerman, 1 sampai 3 menit. "
              : "Unggah berkas asli yang dipindai, bukan tautan Drive. "}
            Format {rule.label}, maksimal {formatFileSize(rule.max)}.
          </Text>

          {replace && (
            <Notice tone={verified ? "warning" : "info"}>
              {currentFile ? `Berkas saat ini: ${currentFile}. ` : ""}
              {verified
                ? `${name} sudah terverifikasi. Menggantinya mengembalikan statusnya ke Menunggu sampai Admission memeriksa berkas baru.`
                : "Berkas baru menggantikan yang lama."}
            </Notice>
          )}

          <Dropzone
            onDrop={(files) => setFile(files[0] ?? null)}
            onReject={() =>
              notify.error(
                `Berkas ditolak. Format ${rule.label}, maksimal ${formatFileSize(rule.max)}.`,
              )
            }
            maxSize={rule.max}
            maxFiles={1}
            accept={rule.accept}
          >
            <DropzoneBody
              prompt={file ? `${file.name} · ${formatFileSize(file.size)}` : undefined}
              rule={`Format ${rule.label}, maksimal ${formatFileSize(rule.max)}.`}
            />
          </Dropzone>

          {previewUrl && (
            <div className="stack stack-sm">
              <span className="field-label">Pratinjau</span>
              {kind === "video" ? (
                // Tanpa autoplay: siswa yang menekan putar.
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
              ) : (
                <iframe
                  title={`Pratinjau ${name}`}
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
            <button type="button" className="btn btn-secondary" onClick={close}>
              Batal
            </button>
            <button
              type="button"
              className={`btn ${verified ? "btn-danger" : "btn-primary"}`}
              disabled={!file}
              onClick={() => {
                notify.success(`${name} terkirim. Menunggu verifikasi Admission.`)
                close()
              }}
            >
              {replace ? "Ganti Berkas" : "Kirim"}
            </button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
