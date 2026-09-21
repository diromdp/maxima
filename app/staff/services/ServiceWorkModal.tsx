"use client"

import { Modal, Select, Textarea, TextInput } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { Dropzone, MIME_TYPES } from "@mantine/dropzone"
import { useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { Notice } from "@/src/components/ui/Notice"

import { type DetailRow, PICS, type ServiceWork } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export type WorkPatch = Pick<
  ServiceWork,
  "progress" | "pic" | "startedAt" | "finishedAt" | "note" | "result"
>

export function ServiceWorkModal({
  row,
  studentName,
  onClose,
  onSave,
}: {
  row: DetailRow | null
  studentName: string
  onClose: () => void
  onSave: (id: DetailRow["id"], patch: WorkPatch) => void
}) {
  const [draft, setDraft] = useState<WorkPatch>({
    progress: row?.progress ?? null,
    pic: row?.pic ?? null,
    startedAt: row?.startedAt ?? null,
    finishedAt: row?.finishedAt ?? null,
    note: row?.note ?? null,
    result: row?.result ?? null,
  })
  const isReversed =
    draft.startedAt !== null && draft.finishedAt !== null && draft.finishedAt < draft.startedAt
  const canSave = draft.pic !== null && !isReversed

  return (
    <Modal
      opened={row !== null}
      onClose={onClose}
      title={row ? `Ubah Layanan ${row.label}` : "Ubah Layanan"}
      size="lg"
      styles={TITLE_STYLE}
    >
      {row && (
        <form
          className="stack stack-lg"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canSave) return
            onSave(row.id, draft)
            onClose()
          }}
        >
          <Notice tone="info">
            Status gerbang {studentName} untuk {row.label} tetap {row.state}, dihitung dari
            pembayaran. Yang diubah di sini hanya pengerjaannya; hasil yang diunggah tampil sebagai
            unduhan di portal siswa.
          </Notice>

          <div className="grid-2">
            <Select
              label="PIC"
              placeholder="Pilih PIC"
              data={[...PICS]}
              value={draft.pic}
              onChange={(value) => setDraft({ ...draft, pic: value })}
              required
            />
            <TextInput
              label="Progres / Aksi yang Perlu"
              placeholder="Contoh: Menunggu jadwal Goethe"
              value={draft.progress ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, progress: event.currentTarget.value || null })
              }
            />
          </div>

          <DatesProvider settings={{ locale: "id" }}>
            <div className="grid-2">
              <DateInput
                label="Tanggal Mulai"
                placeholder="Pilih tanggal"
                valueFormat="DD MMM YYYY"
                value={draft.startedAt}
                onChange={(value) => setDraft({ ...draft, startedAt: value })}
                clearable
              />
              <DateInput
                label="Tanggal Selesai"
                placeholder="Kosongkan bila masih berjalan"
                valueFormat="DD MMM YYYY"
                value={draft.finishedAt}
                onChange={(value) => setDraft({ ...draft, finishedAt: value })}
                error={isReversed ? "Tanggal selesai sebelum tanggal mulai" : undefined}
                clearable
              />
            </div>
          </DatesProvider>

          <Textarea
            label="Catatan"
            placeholder="Contoh: Rencana Goethe Desember 2026"
            autosize
            minRows={2}
            value={draft.note ?? ""}
            onChange={(event) => setDraft({ ...draft, note: event.currentTarget.value || null })}
          />

          <div className="stack stack-sm">
            <span className="field-label">Hasil</span>
            {draft.result ? (
              <div className="row row-between row-soft">
                <span className="body-sm">{draft.result.label}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setDraft({ ...draft, result: null })}
                >
                  Ganti
                </button>
              </div>
            ) : (
              <Dropzone
                onDrop={(files) =>
                  files[0] &&
                  setDraft({
                    ...draft,
                    result: { label: files[0].name, href: `/files/${files[0].name}` },
                  })
                }
                maxFiles={1}
                multiple={false}
                accept={[MIME_TYPES.pdf, MIME_TYPES.jpeg, MIME_TYPES.png]}
              >
                <DropzoneBody rule="PDF, JPG, atau PNG. Berkas hasil menandai layanan selesai dan tampil di rumpun Hasil Layanan siswa." />
              </Dropzone>
            )}
          </div>

          <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSave}
              title={
                draft.pic === null
                  ? "Pilih PIC dulu"
                  : isReversed
                    ? "Perbaiki urutan tanggal"
                    : undefined
              }
            >
              Simpan Layanan
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
