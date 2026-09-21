"use client"

import { Modal, NumberInput, Select, TextInput } from "@mantine/core"
import { MonthPickerInput } from "@mantine/dates"
import { Dropzone, MIME_TYPES } from "@mantine/dropzone"
import { useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { Notice } from "@/src/components/ui/Notice"
import { notify } from "@/src/lib/notify"

import { CERTIFICATE_KINDS, LEVELS, MODULES } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function CertificateFormModal({
  opened,
  onClose,
}: {
  opened: boolean
  onClose: () => void
}) {
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Tambah Data Sertifikat"
      size="lg"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          notify.success(
            "Data sertifikat disimpan. Nilai berlaku setelah dicocokkan dengan berkas.",
          )
          onClose()
        }}
      >
        <Notice tone="info">
          Isi nilai persis seperti di berkas sertifikat. Nilai yang diusulkan siswa dari portal
          berstatus menunggu sampai dicocokkan di sini.
        </Notice>

        <TextInput
          name="studentName"
          label="Nama Siswa"
          placeholder="Cari nama atau NIS"
          required
        />

        <div className="grid-2">
          <Select
            name="kind"
            label="Jenis"
            placeholder="Pilih jenis"
            data={[...CERTIFICATE_KINDS]}
            required
          />
          <Select
            name="level"
            label="Level"
            placeholder="Pilih level"
            data={[...LEVELS]}
            required
          />
        </div>

        <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0, gap: 12 }}>
          <span className="field-label">Nilai dan masa berlaku per modul</span>
          {MODULES.map((module) => (
            <div key={module.key} className="grid-2">
              <NumberInput
                name={`${module.key}-score`}
                label={module.label}
                placeholder="0-100"
                min={0}
                max={100}
                clampBehavior="strict"
                allowDecimal={false}
                hideControls
                required
              />
              <MonthPickerInput
                name={`${module.key}-expiry`}
                label={`Berlaku sampai (${module.label})`}
                placeholder="Pilih bulan"
                valueFormat="MM/YYYY"
                required
              />
            </div>
          ))}
        </fieldset>

        <div className="stack stack-sm">
          <span className="field-label">Berkas sertifikat</span>
          {fileName ? (
            <div className="row row-between row-soft">
              <span className="body-sm">{fileName}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setFileName(null)}
              >
                Ganti
              </button>
            </div>
          ) : (
            <Dropzone
              onDrop={(files) => setFileName(files[0]?.name ?? null)}
              maxFiles={1}
              multiple={false}
              accept={[MIME_TYPES.pdf, MIME_TYPES.jpeg, MIME_TYPES.png]}
            >
              <DropzoneBody rule="PDF, JPG, atau PNG. Berkas menempel pada data sertifikat ini." />
            </Dropzone>
          )}
        </div>

        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Simpan Sertifikat
          </button>
        </div>
      </form>
    </Modal>
  )
}
