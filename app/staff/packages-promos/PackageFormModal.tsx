"use client"

import { Checkbox, Group, Modal, NumberInput, TextInput } from "@mantine/core"
import { notify } from "@/src/lib/notify"

import { GATE_NAMES, GATES_BY_PACKAGE, type PackageRow } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

const RUPIAH = { prefix: "Rp ", thousandSeparator: ".", decimalSeparator: ",", hideControls: true }

export function PackageFormModal({
  opened,
  onClose,
  initial,
}: {
  opened: boolean
  onClose: () => void
  initial?: PackageRow
}) {
  const gates = initial ? GATES_BY_PACKAGE[initial.id] : undefined

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initial ? `Ubah ${initial.name}` : "Tambah Paket"}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          notify.success(
            initial
              ? `Perubahan ${initial.name} disimpan dan dicatat di log aktivitas.`
              : "Paket baru disimpan dan dicatat di log aktivitas.",
          )
          onClose()
        }}
        onReset={onClose}
      >
        <TextInput
          name="name"
          label="Nama Paket"
          placeholder="Ausbildung 45"
          defaultValue={initial?.name}
          required
        />

        <div className="grid-2">
          <NumberInput
            name="price"
            label="Harga Layanan (Rp)"
            description="Satu harga utuh, sudah mencakup akademik dan administrasi penempatan."
            placeholder="45.000.000"
            min={0}
            defaultValue={initial?.price.amount}
            required
            {...RUPIAH}
          />
          <NumberInput
            name="priceEur"
            label="Harga Layanan (Euro)"
            description="Kosongkan bila paket tanpa penempatan kerja."
            placeholder="800"
            prefix="€ "
            min={0}
            hideControls
            defaultValue={initial?.serviceFeeEur ? initial.serviceFeeEur.amount / 100 : undefined}
          />
        </div>

        <div className="grid-2">
          <Checkbox
            name="bridgingId"
            label="Dana Talang ID"
            description="Paket memakai dana talang Indonesia."
            defaultChecked={initial?.bridgingId}
          />
          <Checkbox
            name="bridgingDe"
            label="Dana Talang DE"
            description="Paket memakai dana talang Jerman."
            defaultChecked={initial?.bridgingDe}
          />
        </div>

        <div className="grid-2">
          <NumberInput
            name="monthly"
            label="Nominal Bulanan"
            description="Kosongkan bila paket tanpa cicilan bulanan."
            placeholder="3.333.000"
            min={0}
            defaultValue={initial?.monthly?.amount}
            {...RUPIAH}
          />
          <NumberInput
            name="billingDay"
            label="Tanggal Tagih"
            description="Tanggal 1 sampai 28, berlaku untuk seluruh siswa paket ini."
            placeholder="20"
            min={1}
            max={28}
            defaultValue={initial?.billingDay ?? undefined}
          />
        </div>

        <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0, gap: 12 }}>
          <div className="stack" style={{ gap: 2 }}>
            <span className="field-label">9 Gerbang Pembayaran (Rp)</span>
            <span className="caption text-muted">
              Titik cicilan terhadap harga utuh, bukan harga layanan. 0 = langsung terbuka.
              Kosongkan bila layanan tidak termasuk paket.
            </span>
          </div>
          <div className="grid-3">
            {GATE_NAMES.map((gate, index) => (
              <NumberInput
                key={gate}
                name={`gate-${index}`}
                label={gate}
                placeholder="—"
                min={0}
                defaultValue={gates?.[index] ?? undefined}
                {...RUPIAH}
              />
            ))}
          </div>
        </fieldset>

        <Group justify="flex-end">
          <button type="reset" className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            {initial ? "Simpan Perubahan" : "Simpan Paket"}
          </button>
        </Group>
      </form>
    </Modal>
  )
}
