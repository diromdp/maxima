"use client"

import { Modal, NumberInput, Select, TextInput } from "@mantine/core"
import { DateInput, DatesProvider, TimeInput } from "@mantine/dates"

import { notify } from "@/src/lib/notify"

import { CANDIDATES, PARTNERS, TRAINERS } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function PracticeFormModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Jadwalkan Latihan Wawancara"
      size="lg"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          notify.success("Latihan dijadwalkan. Siswa melihat jadwalnya di portal.")
          onClose()
        }}
      >
        <Select
          label="Siswa"
          placeholder="Pilih siswa"
          searchable
          data={CANDIDATES.map((row) => ({ value: row.nis, label: `${row.name} · ${row.nis}` }))}
          required
        />
        <div className="grid-2">
          <Select
            label="Partner yang dilamar"
            placeholder="Pilih partner"
            data={PARTNERS.map((partner) => ({ value: partner.id, label: partner.shortName }))}
            required
          />
          <TextInput label="Posisi Dilamar" placeholder="Perawat (FSJ)" required />
        </div>
        <DatesProvider settings={{ locale: "id" }}>
          <div className="grid-2">
            <DateInput
              label="Tanggal"
              placeholder="Pilih tanggal"
              valueFormat="DD MMM YYYY"
              required
            />
            <TimeInput label="Jam" required />
          </div>
        </DatesProvider>
        <div className="grid-2">
          <NumberInput
            label="Wawancara Ke"
            description="Simulasi ke berapa untuk siswa ini."
            placeholder="1"
            min={1}
            allowDecimal={false}
            required
          />
          <Select label="PIC Pelatih" placeholder="Pilih pelatih" data={[...TRAINERS]} required />
        </div>
        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Jadwalkan
          </button>
        </div>
      </form>
    </Modal>
  )
}
