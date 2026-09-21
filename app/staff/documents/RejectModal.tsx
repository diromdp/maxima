"use client"

import { Modal, Textarea } from "@mantine/core"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"

import type { GroupId } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export type RejectTarget = {
  readonly nis: string
  readonly groupId: GroupId
  readonly studentName: string
  readonly fileName: string
  readonly uploadedName?: string
}

export function RejectModal({
  target,
  onClose,
  onReject,
}: {
  target: RejectTarget | null
  onClose: () => void
  onReject: (target: RejectTarget, reason: string) => void
}) {
  const [reason, setReason] = useState("")
  const trimmed = reason.trim()

  return (
    <Modal
      opened={target !== null}
      onClose={onClose}
      title={target ? `Tolak ${target.fileName}` : "Tolak berkas"}
      size="md"
      styles={TITLE_STYLE}
    >
      {target && (
        <form
          className="stack stack-lg"
          onSubmit={(event) => {
            event.preventDefault()
            if (trimmed === "") return
            onReject(target, trimmed)
            onClose()
          }}
        >
          <Notice tone="warning">
            Alasan ini dibaca {target.studentName} apa adanya di portal, di samping tombol unggah
            ulang. Sebut apa yang salah dan apa yang harus diunggah.
          </Notice>
          <Textarea
            label="Alasan penolakan"
            description={
              target.uploadedName ? `Berkas yang ditolak: ${target.uploadedName}` : undefined
            }
            placeholder="Contoh: Hasil pindai buram, nama tidak terbaca. Unggah ulang dengan pindaian berwarna."
            autosize
            minRows={3}
            value={reason}
            onChange={(event) => setReason(event.currentTarget.value)}
            required
          />
          <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-error"
              disabled={trimmed === ""}
              title={trimmed === "" ? "Alasan wajib diisi" : undefined}
            >
              Tolak Berkas
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
