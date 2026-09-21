"use client"

import { Checkbox, Group, Modal, Textarea, TextInput } from "@mantine/core"
import { notify } from "@/src/lib/notify"
import { useState } from "react"

import { type Access, PAGES, type PageId, ROLE_ACCESS } from "@/src/lib/auth/permissions"

import type { Role } from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

type AccessMap = Partial<Record<PageId, Access>>

// Kelompok mengikuti urutan sidebar; halaman tanpa kelompok (Dashboard) di atas.
const GROUPS = [...new Set(PAGES.map((p) => p.group))]

function nextAccess(
  current: Access | undefined,
  box: Access,
  checked: boolean,
): Access | undefined {
  if (box === "edit") return checked ? "edit" : current ? "view" : undefined
  return checked ? (current ?? "view") : undefined
}

/**
 * Tambah dan Edit peran dalam satu modal. Hak akses memakai daftar `PAGES`
 * yang sama dengan sidebar, jadi menambah halaman otomatis menambah barisnya.
 * Ubah mencakup Lihat: mencentang Ubah ikut mencentang Lihat, mencabut Lihat
 * mencabut keduanya.
 */
export function RoleModal({
  opened,
  onClose,
  initial,
}: {
  opened: boolean
  onClose: () => void
  initial?: Role
}) {
  const [access, setAccess] = useState<AccessMap>(() =>
    initial ? { ...ROLE_ACCESS[initial.name] } : {},
  )
  const granted = Object.keys(access).length

  const set = (page: PageId, box: Access, checked: boolean) =>
    setAccess((a) => {
      const next = { ...a }
      const value = nextAccess(a[page], box, checked)
      if (value) next[page] = value
      else delete next[page]
      return next
    })

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initial ? `Ubah Peran ${initial.name}` : "Tambah Peran"}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(e) => {
          e.preventDefault()
          notify.success(
            initial ? `Perubahan peran ${initial.name} disimpan.` : "Peran baru disimpan.",
          )
          onClose()
        }}
        onReset={onClose}
      >
        <TextInput
          name="name"
          label="Nama Peran"
          placeholder="Contoh: Staf Admisi Cabang"
          defaultValue={initial?.name}
          required
        />
        <Textarea
          name="description"
          label="Deskripsi"
          placeholder="Siapa yang memakai peran ini dan apa batasnya"
          defaultValue={initial?.description}
          autosize
          minRows={2}
        />

        <div className="stack stack-sm">
          <div className="row row-between">
            <span className="label">Hak Akses</span>
            <span className="caption text-muted tabular">
              {granted} dari {PAGES.length} halaman
            </span>
          </div>

          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Halaman</th>
                  <th scope="col" className="numeric">
                    Lihat
                  </th>
                  <th scope="col" className="numeric">
                    Ubah
                  </th>
                </tr>
              </thead>
              <tbody>
                {GROUPS.map((group) => (
                  <RowGroup key={group ?? "root"} title={group}>
                    {PAGES.filter((p) => p.group === group).map((p) => {
                      const level = access[p.id]
                      return (
                        <tr key={p.id}>
                          <td>{p.label}</td>
                          <td className="numeric">
                            <Checkbox
                              aria-label={`Lihat ${p.label}`}
                              checked={level !== undefined}
                              onChange={(e) => set(p.id, "view", e.currentTarget.checked)}
                              style={{ display: "inline-flex" }}
                            />
                          </td>
                          <td className="numeric">
                            <Checkbox
                              aria-label={`Ubah ${p.label}`}
                              checked={level === "edit"}
                              onChange={(e) => set(p.id, "edit", e.currentTarget.checked)}
                              style={{ display: "inline-flex" }}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </RowGroup>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Group justify="flex-end">
          <button type="reset" className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" className="btn btn-primary">
            Simpan Peran
          </button>
        </Group>
      </form>
    </Modal>
  )
}

function RowGroup({ title, children }: { title: string | null; children: React.ReactNode }) {
  return (
    <>
      {title && (
        <tr>
          <td colSpan={3} className="label text-muted">
            {title}
          </td>
        </tr>
      )}
      {children}
    </>
  )
}
