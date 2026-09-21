"use client"

import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Group, Modal, TextInput } from "@mantine/core"
import { modals } from "@mantine/modals"
import { notify } from "@/src/lib/notify"
import { useState } from "react"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

// Lebar kolom kanan dikunci supaya baris judul dan baris isi sejajar.
const NO_W = 20
const META_W = 96
const ACTION_W = 72

/**
 * Satu panel master: judul + penghitung + Tambah, lalu daftar baris tanpa kepala
 * tabel - nama di kiri, keterangan dan aksi (ubah, hapus) di kanan. `trailing`
 * mengganti dua ikon aksi untuk panel yang kendalinya lain (Daftar Layanan
 * memakai saklar).
 */
export function MasterPanel<T>({
  title,
  unit,
  rows,
  rowKey,
  rowName,
  rowSub,
  nameHeader = "Nama",
  metaHeader,
  meta,
  trailingHeader = "Aksi",
  trailing,
  formFields,
  modalSize,
}: {
  title: string
  /** Satuan penghitung: "cabang", "program", ... */
  unit: string
  rows: readonly T[]
  rowKey: (row: T) => string
  rowName: (row: T) => string
  /** Baris kecil di bawah nama, misalnya cuplikan isi. */
  rowSub?: (row: T) => React.ReactNode
  nameHeader?: string
  /** Judul kolom keterangan; wajib ada kalau `meta` diisi. */
  metaHeader?: string
  /** Keterangan di kanan nama: status, kategori. */
  meta?: (row: T) => React.ReactNode
  trailingHeader?: string
  /** Kendali di ujung kanan; default dua ikon ubah dan hapus. */
  trailing?: (row: T) => React.ReactNode
  /** Kolom tambahan di form Tambah/Ubah, setelah Nama. */
  formFields?: (initial: T | undefined) => React.ReactNode
  modalSize?: "md" | "lg" | "xl"
}) {
  const [editing, setEditing] = useState<T | null>(null)
  const [adding, setAdding] = useState(false)
  const close = () => {
    setEditing(null)
    setAdding(false)
  }
  const name = editing ? rowName(editing) : ""

  // Hapus, bukan nonaktifkan (keputusan pemilik repo 19 Sep 2026, berbeda dari
  // PRD 20 aturan). Tetap lewat dialog - tindakan yang tidak bisa dibatalkan
  // tidak boleh satu klik.
  function confirmDelete(row: T) {
    modals.openConfirmModal({
      title: `Hapus ${rowName(row)}?`,
      children: `${rowName(row)} dihapus dari daftar ${unit} dan tidak lagi bisa dipilih di formulir. Tindakan ini tidak bisa dibatalkan.`,
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: () => notify.success(`${rowName(row)} dihapus.`),
    })
  }

  return (
    <section className="card stack">
      <div className="row row-between">
        <div className="row" style={{ minWidth: 0, gap: 8 }}>
          <h2 className="h6">{title}</h2>
          <span className="caption text-faint tabular">{rows.length}</span>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          aria-label={`Tambah ${unit}`}
          onClick={() => setAdding(true)}
        >
          + Tambah
        </button>
      </div>

      <div className="list-rows">
        <div className="row row-between label text-muted" aria-hidden>
          <div className="row" style={{ minWidth: 0, gap: 12 }}>
            <span style={{ width: NO_W }}>No</span>
            <span>{nameHeader}</span>
          </div>
          <div className="row" style={{ gap: 12, flexShrink: 0 }}>
            {meta && <span style={{ width: META_W, textAlign: "right" }}>{metaHeader}</span>}
            <span style={{ width: ACTION_W, textAlign: "right" }}>{trailingHeader}</span>
          </div>
        </div>
        {rows.map((row, i) => (
          <div key={rowKey(row)} className="row row-between">
            <div className="row" style={{ minWidth: 0, gap: 12 }}>
              <span className="caption text-faint tabular" style={{ width: NO_W }}>
                {i + 1}
              </span>
              <div className="stack" style={{ gap: 0, minWidth: 0 }}>
                <span className="body-sm text-ink">{rowName(row)}</span>
                {rowSub?.(row)}
              </div>
            </div>
            <div className="row" style={{ gap: 12, flexShrink: 0 }}>
              {meta && <span style={{ width: META_W, textAlign: "right" }}>{meta(row)}</span>}
              {trailing ? (
                <span
                  style={{ width: ACTION_W, display: "inline-flex", justifyContent: "flex-end" }}
                >
                  {trailing(row)}
                </span>
              ) : (
                <div className="row text-faint" style={{ gap: 0, width: ACTION_W }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    aria-label={`Ubah ${rowName(row)}`}
                    title="Ubah"
                    onClick={() => setEditing(row)}
                  >
                    <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    aria-label={`Hapus ${rowName(row)}`}
                    title="Hapus"
                    onClick={() => confirmDelete(row)}
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        opened={adding || editing !== null}
        onClose={close}
        title={editing ? `Ubah ${name}` : `Tambah ${title}`}
        size={modalSize}
        styles={TITLE_STYLE}
      >
        <form
          key={name}
          className="stack stack-lg"
          onSubmit={(e) => {
            e.preventDefault()
            notify.success(editing ? `Perubahan ${name} disimpan.` : `${title} baru disimpan.`)
            close()
          }}
          onReset={close}
        >
          <TextInput
            name="name"
            label="Nama"
            placeholder={`Nama ${unit} baru`}
            defaultValue={name}
            required
            data-autofocus
          />
          {formFields?.(editing ?? undefined)}
          <Group justify="flex-end">
            <button type="reset" className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan
            </button>
          </Group>
        </form>
      </Modal>
    </section>
  )
}
