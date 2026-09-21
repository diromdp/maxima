"use client"

import { Modal, NumberInput, Select, TextInput } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"

import { notify } from "@/src/lib/notify"

import { CERTIFICATE_KINDS, LEVELS } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function ScheduleFormModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Tambah Jadwal Ujian"
      size="md"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          notify.success("Jadwal ujian disimpan dan tampil di Kalender Akademik.")
          onClose()
        }}
      >
        <div className="grid-2">
          <Select
            name="kind"
            label="Penyelenggara"
            placeholder="Pilih"
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
        <DatesProvider settings={{ locale: "id" }}>
          <DateInput
            name="date"
            label="Tanggal Ujian"
            placeholder="Pilih tanggal"
            valueFormat="DD MMM YYYY"
            required
          />
        </DatesProvider>
        <TextInput name="location" label="Lokasi" placeholder="Pusat Jakarta" required />
        <NumberInput
          name="capacity"
          label="Kuota"
          description="Pendaftaran di atas kuota butuh konfirmasi."
          placeholder="30"
          min={1}
          allowDecimal={false}
          required
        />
        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Simpan Jadwal
          </button>
        </div>
      </form>
    </Modal>
  )
}
