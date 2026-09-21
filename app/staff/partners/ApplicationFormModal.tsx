"use client"

import { Modal, Select, Textarea, TextInput } from "@mantine/core"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { notify } from "@/src/lib/notify"

import { APPLICATION_STATUSES, CANDIDATES, PARTNERS } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function ApplicationFormModal({
  opened,
  onClose,
}: {
  opened: boolean
  onClose: () => void
}) {
  const [nis, setNis] = useState<string | null>(null)
  const candidate = CANDIDATES.find((row) => row.nis === nis)
  const blockers = candidate
    ? [
        ...candidate.missingBewerbung.map((file) => `Berkas Bewerbung belum lengkap: ${file}`),
        ...(candidate.certificateValid ? [] : ["Sertifikat bahasa sudah kedaluwarsa"]),
      ]
    : []
  const isBlocked = blockers.length > 0
  const activePartners = PARTNERS.filter((partner) => partner.status === "Aktif")

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Tambah Pengajuan"
      size="lg"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          if (!candidate || isBlocked) return
          notify.success(`Pengajuan ${candidate.name} disimpan.`)
          onClose()
        }}
      >
        <Select
          label="Siswa"
          placeholder="Pilih siswa"
          searchable
          data={CANDIDATES.map((row) => ({ value: row.nis, label: `${row.name} · ${row.nis}` }))}
          value={nis}
          onChange={setNis}
          required
        />

        {isBlocked && (
          <Notice tone="danger" title="Pengajuan ditahan">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {blockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
            Lengkapi lewat halaman Dokumen atau Ujian & Sertifikat, lalu ajukan lagi.
          </Notice>
        )}

        <div className="grid-2">
          <Select
            label="Partner"
            placeholder="Pilih partner aktif"
            data={activePartners.map((partner) => ({ value: partner.id, label: partner.name }))}
            required
          />
          <TextInput label="Posisi" placeholder="Perawat (FSJ)" required />
        </div>

        <Select
          label="Status Progres"
          data={[...APPLICATION_STATUSES]}
          defaultValue={APPLICATION_STATUSES[0]}
          allowDeselect={false}
          required
        />

        <div className="grid-2">
          <Textarea
            label="Catatan Partner"
            placeholder="Umpan balik dari partner"
            autosize
            minRows={2}
          />
          <Textarea
            label="Catatan Admission"
            description="Internal, tidak tampil di portal siswa."
            placeholder="Tindak lanjut internal"
            autosize
            minRows={2}
          />
        </div>

        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!candidate || isBlocked}
            title={
              !candidate
                ? "Pilih siswa dulu"
                : isBlocked
                  ? "Syarat pengajuan belum terpenuhi"
                  : undefined
            }
          >
            Simpan Pengajuan
          </button>
        </div>
      </form>
    </Modal>
  )
}
