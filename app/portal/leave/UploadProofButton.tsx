"use client"

import { Group, Modal, Stack, Text } from "@mantine/core"
import { Dropzone } from "@mantine/dropzone"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { Notice } from "@/src/components/ui/Notice"
import { presignLeaveProof, submitLeaveProof } from "@/src/entities/leave/actions"
import type { LeaveDetail } from "@/src/entities/leave/schema"
import { type ActionResult, failureOf } from "@/src/lib/api/errors"
import { formatFileSize } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"
import {
  isUploadable,
  putToStorage,
  UPLOAD_FAILED,
  UPLOAD_MAX_BYTES,
  UPLOAD_RULE,
  UPLOAD_TYPES,
} from "@/src/lib/upload"

async function sendProof(leaveId: string, file: File): Promise<ActionResult> {
  if (!isUploadable(file)) return failureOf(UPLOAD_RULE)
  const presigned = await presignLeaveProof(file.type, file.size)
  if (!presigned.ok) return presigned
  if (!(await putToStorage(presigned.data, file))) return failureOf(UPLOAD_FAILED)
  return submitLeaveProof(leaveId, presigned.data.proofId)
}

export function UploadProofButton({ leave }: { leave: LeaveDetail }) {
  const queryClient = useQueryClient()
  const [opened, setOpened] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const upload = useMutation({ mutationFn: (chosen: File) => sendProof(leave.id, chosen) })

  function close() {
    setOpened(false)
    setFile(null)
    setError(null)
  }

  async function send(chosen: File) {
    setError(null)
    const result = await upload.mutateAsync(chosen)
    if (!result.ok) return setError(result.message)
    notify.success("Bukti pembayaran terkirim. Finance memverifikasinya.")
    await queryClient.invalidateQueries({ queryKey: ["leaves", "me"] })
    close()
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
          {error && <Notice tone="danger">{error}</Notice>}
          <Text size="sm" c="dimmed">
            Unggah bukti transfer sebesar {formatMoney(idr(leave.finance.amountIdr ?? 0))}.
          </Text>

          <Dropzone
            onDrop={(files) => setFile(files[0] ?? null)}
            onReject={() => notify.error(UPLOAD_RULE)}
            maxSize={UPLOAD_MAX_BYTES}
            maxFiles={1}
            accept={[...UPLOAD_TYPES]}
          >
            <DropzoneBody
              prompt={file ? `${file.name} · ${formatFileSize(file.size)}` : undefined}
              rule={UPLOAD_RULE}
            />
          </Dropzone>

          <Group justify="flex-end">
            <button type="button" className="btn btn-secondary" onClick={close}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!file || upload.isPending}
              title={file ? undefined : "Pilih berkas bukti transfer dulu."}
              onClick={() => file && void send(file)}
            >
              {upload.isPending ? "Mengirim..." : "Kirim Bukti"}
            </button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
