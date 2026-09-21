"use client"

import { Group, Modal, NumberInput, Select, Stack, Text } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { Dropzone, MIME_TYPES } from "@mantine/dropzone"
import { notify } from "@/src/lib/notify"
import { useState } from "react"

import { DropzoneBody } from "@/src/components/ui/DropzoneBody"
import { formatFileSize } from "@/src/lib/format"

import { JENIS_SERTIFIKAT, LEVEL, MODUL, type Sertifikat } from "./certificates"

const MAKS_BYTE = 5 * 1024 * 1024

/**
 * Modal terpusat berisi form sertifikat. Tanpa `initial` = tambah baru;
 * dengan `initial` = ubah, field terisi dari data dan berkas lama tetap
 * dipakai kalau tidak diganti. `key` di pemanggil mengosongkan form saat
 * sertifikat yang diubah berganti.
 */
export function CertificateModal({
  opened,
  onClose,
  initial,
}: {
  opened: boolean
  onClose: () => void
  initial?: Sertifikat
}) {
  const [berkas, setBerkas] = useState<File | null>(null)

  function close() {
    setBerkas(null)
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={
        initial ? `Ubah Sertifikat ${initial.jenis} ${initial.level}` : "Tambah Sertifikat Baru"
      }
      size="xl"
      styles={{ title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }}
    >
      <form
        className="stack stack-lg"
        onSubmit={(e) => {
          e.preventDefault()
          notify.success(
            initial
              ? "Perubahan dikirim. Statusnya kembali Menunggu sampai Admin memverifikasi."
              : "Sertifikat dikirim. Statusnya Menunggu sampai Admin memverifikasi.",
          )
          close()
        }}
        onReset={close}
      >
        <div className="grid-2">
          <Select
            name="jenis"
            label="Jenis Sertifikat"
            placeholder="Pilih jenis"
            data={[...JENIS_SERTIFIKAT]}
            defaultValue={initial?.jenis}
            required
          />
          <Select
            name="level"
            label="Tingkat / Level"
            placeholder="Pilih level"
            data={[...LEVEL]}
            defaultValue={initial?.level}
            required
          />
        </div>

        <div className="grid-4">
          {MODUL.map(({ key, label }) => (
            <NumberInput
              key={key}
              name={`nilai-${key}`}
              label={`Nilai ${label}`}
              placeholder="0 sampai 100"
              min={0}
              max={100}
              defaultValue={initial?.modul[key].nilai ?? undefined}
            />
          ))}
        </div>

        <div className="grid-4">
          {MODUL.map(({ key, label }) => (
            <DateInput
              key={key}
              name={`expired-${key}`}
              label={`${label} Expired`}
              placeholder="dd/mm/yyyy"
              valueFormat="DD/MM/YYYY"
              defaultValue={initial ? new Date(initial.modul[key].expired) : undefined}
            />
          ))}
        </div>

        <Stack gap="xs">
          <Text className="field-label" component="span">
            Upload Sertifikat
          </Text>
          <Text className="field-hint" component="span">
            {initial
              ? `Berkas saat ini: ${initial.berkas}. Unggah hanya kalau ingin menggantinya (PDF, maks 5 MB).`
              : "Jika terpisah, gabungkan dalam 1 PDF (maks 5 MB)"}
          </Text>
          <Dropzone
            onDrop={(files) => setBerkas(files[0] ?? null)}
            onReject={() => notify.error("Berkas ditolak. Format PDF, maksimal 5 MB.")}
            maxSize={MAKS_BYTE}
            maxFiles={1}
            accept={[MIME_TYPES.pdf]}
          >
            <DropzoneBody
              prompt={berkas ? `${berkas.name} · ${formatFileSize(berkas.size)}` : undefined}
              rule={`PDF. Maksimal ${formatFileSize(MAKS_BYTE)}.`}
            />
          </Dropzone>
        </Stack>

        <Group justify="flex-end">
          <button type="reset" className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            {initial ? "Simpan Perubahan" : "Simpan Sertifikat"}
          </button>
        </Group>
      </form>
    </Modal>
  )
}

/** Tombol Tambah Sertifikat di baris aksi atas tabel, beserta modalnya. */
export function AddCertificateModal() {
  const [opened, setOpened] = useState(false)

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpened(true)}>
        Tambah Sertifikat
      </button>
      <CertificateModal opened={opened} onClose={() => setOpened(false)} />
    </>
  )
}
