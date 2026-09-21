"use client"

import { useState } from "react"
import { Group, Modal, Stack, Text } from "@mantine/core"
import { Dropzone, MIME_TYPES } from "@mantine/dropzone"
import { notify } from "@/src/lib/notify"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { formatFileSize } from "@/src/lib/format"
import { formatMoney, type Money } from "@/src/lib/money"

const MAX_BYTES = 5 * 1024 * 1024

export function UploadProofButton({ amountDue }: { amountDue: Money }) {
  const [opened, setOpened] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  function close() {
    setOpened(false)
    setFile(null)
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpened(true)}>
        Unggah Bukti
      </button>

      <Modal
        opened={opened}
        onClose={close}
        title="Unggah Bukti Pembayaran"
        size="lg"
        styles={{ title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }}
      >
        <Stack gap="lg">
          <Text size="sm" c="dimmed">
            Unggah bukti transfer sebesar {formatMoney(amountDue)}. Format PDF atau gambar, maksimal{" "}
            {formatFileSize(MAX_BYTES)}.
          </Text>

          <Dropzone
            onDrop={(files) => setFile(files[0] ?? null)}
            onReject={() =>
              notify.error(
                `Berkas ditolak. Format PDF atau gambar, maksimal ${formatFileSize(MAX_BYTES)}.`,
              )
            }
            maxSize={MAX_BYTES}
            maxFiles={1}
            accept={[MIME_TYPES.pdf, MIME_TYPES.png, MIME_TYPES.jpeg]}
          >
            <DropzoneBody
              prompt={file ? `${file.name} · ${formatFileSize(file.size)}` : undefined}
              rule={`PDF, PNG, atau JPG. Maksimal ${formatFileSize(MAX_BYTES)}.`}
            />
          </Dropzone>

          <Group justify="flex-end">
            <button type="button" className="btn btn-secondary" onClick={close}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!file}
              title={file ? undefined : "Pilih berkas bukti transfer dulu."}
              onClick={() => {
                notify.success("Bukti pembayaran terkirim. Finance memverifikasinya.")
                close()
              }}
            >
              Kirim Bukti
            </button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
