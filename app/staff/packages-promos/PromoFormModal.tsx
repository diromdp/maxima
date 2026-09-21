"use client"

import { Group, Modal, MultiSelect, NumberInput, Select, TextInput } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { useState } from "react"

import { notify } from "@/src/lib/notify"

import { PACKAGES } from "../../(public)/register/data"
import { DISCOUNT_TYPES, type DiscountType, type Promo, PROMO_STATUSES } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function PromoFormModal({
  opened,
  onClose,
  initial,
}: {
  opened: boolean
  onClose: () => void
  initial?: Promo
}) {
  const [discountType, setDiscountType] = useState<DiscountType>(
    initial?.discountType ?? "Persentase",
  )

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initial ? `Ubah ${initial.name}` : "Tambah Promo"}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          notify.success(initial ? `Perubahan ${initial.name} disimpan.` : "Promo baru disimpan.")
          onClose()
        }}
        onReset={onClose}
      >
        <div className="grid-2">
          <TextInput
            name="name"
            label="Nama Promo"
            placeholder="Promo Awal Tahun"
            defaultValue={initial?.name}
            required
          />
          <TextInput
            name="code"
            label="Kode Voucher"
            description="Yang diketik siswa di formulir pendaftaran."
            placeholder="AWAL2026"
            defaultValue={initial?.code}
            required
          />
        </div>

        <div className="grid-2">
          <Select
            name="discountType"
            label="Jenis Diskon"
            data={[...DISCOUNT_TYPES]}
            value={discountType}
            onChange={(value) => value && setDiscountType(value as DiscountType)}
            allowDeselect={false}
            required
          />
          {discountType === "Persentase" ? (
            <NumberInput
              name="value"
              label="Nilai Diskon"
              placeholder="10"
              suffix=" %"
              min={1}
              max={100}
              hideControls
              defaultValue={initial?.discountType === "Persentase" ? initial.value : undefined}
              required
            />
          ) : (
            <NumberInput
              name="value"
              label="Nilai Diskon"
              placeholder="1.500.000"
              prefix="Rp "
              thousandSeparator="."
              decimalSeparator=","
              min={1}
              hideControls
              defaultValue={initial?.discountType === "Nominal" ? initial.value : undefined}
              required
            />
          )}
        </div>

        <MultiSelect
          name="packageIds"
          label="Berlaku Untuk"
          description="Kosongkan bila berlaku untuk semua paket."
          placeholder="Semua Paket"
          data={PACKAGES.map((pkg) => ({ value: pkg.id, label: pkg.name }))}
          defaultValue={initial ? [...initial.packageIds] : []}
          clearable
        />

        <div className="grid-3">
          <DateInput
            name="start"
            label="Mulai"
            placeholder="dd/mm/yyyy"
            valueFormat="DD/MM/YYYY"
            defaultValue={initial ? new Date(initial.start) : undefined}
            required
          />
          <DateInput
            name="end"
            label="Selesai"
            placeholder="dd/mm/yyyy"
            valueFormat="DD/MM/YYYY"
            defaultValue={initial ? new Date(initial.end) : undefined}
            required
          />
          <Select
            name="status"
            label="Status"
            data={[...PROMO_STATUSES]}
            defaultValue={initial?.status ?? "DRAFT"}
            allowDeselect={false}
            required
          />
        </div>

        <Group justify="flex-end">
          <button type="reset" className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            {initial ? "Simpan Perubahan" : "Simpan Promo"}
          </button>
        </Group>
      </form>
    </Modal>
  )
}
