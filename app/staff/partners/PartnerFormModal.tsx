"use client"

import { Modal, NumberInput, Select, TextInput } from "@mantine/core"

import { notify } from "@/src/lib/notify"

import { INDUSTRIES, PARTNERSHIP_STATUSES } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function PartnerFormModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Modal opened={opened} onClose={onClose} title="Tambah Partner" size="lg" styles={TITLE_STYLE}>
      <form
        className="stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          notify.success("Partner baru disimpan.")
          onClose()
        }}
      >
        <TextInput name="name" label="Nama Perusahaan" placeholder="Asklepios Kliniken" required />
        <div className="grid-2">
          <TextInput name="city" label="Kota" placeholder="Hamburg" required />
          <Select
            name="industry"
            label="Industri"
            placeholder="Pilih industri"
            data={[...INDUSTRIES]}
            required
          />
        </div>
        <div className="grid-2">
          <NumberInput
            name="openPositions"
            label="Posisi Tersedia"
            placeholder="0"
            min={0}
            allowDecimal={false}
            required
          />
          <Select
            name="status"
            label="Status Kerjasama"
            data={[...PARTNERSHIP_STATUSES]}
            defaultValue="Aktif"
            allowDeselect={false}
            required
          />
        </div>
        <TextInput
          name="contact"
          label="Kontak PIC"
          description="Nama dan satu kanal, misalnya telepon atau email."
          placeholder="Dr. Müller (+49 40 ...)"
          required
        />
        <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Simpan Partner
          </button>
        </div>
      </form>
    </Modal>
  )
}
