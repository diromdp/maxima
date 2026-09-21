"use client"

import {
  Checkbox,
  Group,
  Modal,
  MultiSelect,
  PasswordInput,
  Select,
  TextInput,
} from "@mantine/core"
import { notify } from "@/src/lib/notify"

import { BRANCHES, ROLE_NAMES, type StaffUser } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

/**
 * Satu modal untuk Tambah dan Edit pengguna: tanpa `initial` = tambah, dengan
 * `initial` = ubah, field terisi dari baris. `key` di pemanggil mengosongkan
 * form saat baris yang diubah berganti.
 */
export function UserModal({
  opened,
  onClose,
  initial,
}: {
  opened: boolean
  onClose: () => void
  initial?: StaffUser
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initial ? `Ubah Pengguna ${initial.name}` : "Tambah Pengguna"}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(e) => {
          e.preventDefault()
          notify.success(
            initial ? `Perubahan ${initial.name} disimpan.` : "Pengguna baru disimpan.",
          )
          onClose()
        }}
        onReset={onClose}
      >
        <div className="grid-2">
          <TextInput
            name="name"
            label="Nama"
            placeholder="Nama depan atau panggilan"
            defaultValue={initial?.name}
            required
          />
          <TextInput
            name="email"
            type="email"
            label="Email"
            placeholder="nama@maxima.id"
            defaultValue={initial?.email}
            required
          />
        </div>

        <div className="grid-2">
          <PasswordInput
            name="password"
            label={initial ? "Password baru" : "Password"}
            placeholder={initial ? "Kosongkan bila tidak diganti" : "Minimal 8 karakter"}
            autoComplete="new-password"
            required={!initial}
          />
          <Select
            name="role"
            label="Peran"
            placeholder="Pilih peran"
            data={[...ROLE_NAMES]}
            defaultValue={initial?.role}
            required
          />
        </div>

        <MultiSelect
          name="branches"
          label="Cakupan cabang"
          placeholder={initial?.branches ? undefined : "Semua cabang"}
          description="Kosongkan bila pengguna boleh melihat seluruh cabang."
          data={[...BRANCHES]}
          defaultValue={initial?.branches ? [...initial.branches] : []}
          clearable
        />

        <Checkbox
          name="active"
          label="Aktif"
          description="Pengguna nonaktif tidak bisa masuk, datanya tetap tersimpan."
          defaultChecked={initial ? initial.status === "Aktif" : true}
        />

        <Group justify="flex-end">
          <button type="reset" className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Simpan Pengguna
          </button>
        </Group>
      </form>
    </Modal>
  )
}
