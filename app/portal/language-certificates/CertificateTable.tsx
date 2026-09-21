"use client"

import { useState } from "react"
import { modals } from "@mantine/modals"
import { notify } from "@/src/lib/notify"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { DASH } from "@/src/lib/format"

import { CertificateModal } from "./AddCertificateModal"
import {
  alasanTerkunci,
  dapatDiubah,
  deriveStatus,
  formatBulanTahun,
  MODUL,
  SERTIFIKAT,
  segeraKedaluwarsa,
  type Sertifikat,
  type StatusSertifikat,
} from "./certificates"

const BADGE: Readonly<Record<StatusSertifikat, string>> = {
  Terverifikasi: "badge-beres",
  Menunggu: "badge-berjalan",
  Expired: "badge-tindakan",
  "Tidak lulus": "badge-tindakan",
}

const STATUS_OPTIONS: readonly StatusSertifikat[] = [
  "Terverifikasi",
  "Menunggu",
  "Expired",
  "Tidak lulus",
]

type Baris = Sertifikat & { readonly status: StatusSertifikat }

const EXP_HEADER = {
  lesen: "Lesen Exp",
  horen: "Hören Exp",
  schreiben: "Schr. Exp",
  sprechen: "Spr. Exp",
} as const

/** Dua kolom per modul: nilai (angka, rata kanan) dan bulan kedaluwarsa — 13 kolom, ikut lampiran PRD. */
const KOLOM_MODUL: readonly DataColumn<Baris>[] = MODUL.flatMap(({ key, label }) => [
  {
    key: `${key}-nilai`,
    header: label,
    align: "right" as const,
    sort: (s: Baris) => s.modul[key].nilai ?? -1,
    cell: (s: Baris) => s.modul[key].nilai ?? DASH,
  },
  {
    key: `${key}-exp`,
    header: EXP_HEADER[key],
    sort: (s: Baris) => s.modul[key].expired,
    cell: (s: Baris) => formatBulanTahun(s.modul[key].expired),
  },
])

const KOLOM: readonly DataColumn<Baris>[] = [
  { key: "jenis", header: "Jenis", sort: (s) => s.jenis, cell: (s) => s.jenis },
  { key: "level", header: "Level", sort: (s) => s.level, cell: (s) => s.level },
  ...KOLOM_MODUL,
  {
    key: "status",
    header: "Status",
    sort: (s) => s.status,
    cell: (s) => (
      <div className="stack stack-sm">
        <span className={`badge ${BADGE[s.status]}`}>{s.status}</span>
        {segeraKedaluwarsa(s) && <span className="caption text-warning">Segera kedaluwarsa</span>}
      </div>
    ),
  },
  {
    key: "file",
    header: "File",
    cell: (s) => (
      <a className="link" href={`/files/${s.berkas}`} download>
        {s.berkas}
      </a>
    ),
  },
]

function konfirmasiHapus(s: Baris) {
  modals.openConfirmModal({
    title: `Hapus sertifikat ${s.jenis} ${s.level}?`,
    children: `Data nilai dan berkas ${s.berkas} dihapus dari daftar Anda. Tindakan ini tidak bisa dibatalkan.`,
    labels: { confirm: "Hapus", cancel: "Batal" },
    confirmProps: { color: "red" },
    onConfirm: () => notify.success(`Sertifikat ${s.jenis} ${s.level} dihapus.`),
  })
}

/**
 * Edit membuka modal yang sama dengan Tambah, terisi data baris. Hapus lewat
 * dialog konfirmasi — tindakan yang tidak bisa dibatalkan tidak boleh satu
 * klik. Keduanya hanya ada di baris yang `dapatDiubah` (Menunggu, Tidak lulus).
 */
export function CertificateTable() {
  const [editing, setEditing] = useState<Sertifikat | null>(null)
  const rows: readonly Baris[] = SERTIFIKAT.map((s) => ({ ...s, status: deriveStatus(s) }))

  const kolomAksi: DataColumn<Baris> = {
    key: "aksi",
    header: "Aksi",
    cell: (s) => {
      const bisa = dapatDiubah(s)
      // Tombol mati harus terbaca alasannya sebelum ditekan.
      const alasan = bisa ? undefined : alasanTerkunci(s.status)
      return (
        <div className="row" title={alasan}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={!bisa}
            aria-label={alasan ? `Edit tidak tersedia: ${alasan}` : undefined}
            onClick={() => setEditing(s)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-danger-soft btn-sm"
            disabled={!bisa}
            aria-label={alasan ? `Hapus tidak tersedia: ${alasan}` : undefined}
            onClick={() => konfirmasiHapus(s)}
          >
            Hapus
          </button>
        </div>
      )
    },
  }

  return (
    <>
      <DataTable
        rows={rows}
        columns={[...KOLOM, kolomAksi]}
        rowKey={(s) => s.id}
        defaultSort={{ key: "level", dir: "desc" }}
        stickyLast
        filter={{ value: (s) => s.status, options: STATUS_OPTIONS }}
        emptyText="Belum ada sertifikat. Tambahkan lewat tombol Tambah Sertifikat."
      />

      <CertificateModal
        key={editing?.id ?? "none"}
        opened={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
      />
    </>
  )
}
