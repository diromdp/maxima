"use client"

import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"

import { RoleModal } from "./RoleModal"
import { type Role, ROLES, userCount, USERS, type UserStatus } from "./sample"

const BADGE: Readonly<Record<UserStatus, string>> = {
  Aktif: "badge-beres",
  Nonaktif: "badge-tindakan",
}

const COLUMNS: readonly DataColumn<Role & { readonly users: number }>[] = [
  {
    key: "name",
    header: "Nama Peran",
    sort: (r) => r.name,
    cell: (r) => <span className="text-ink">{r.name}</span>,
  },
  { key: "description", header: "Deskripsi", wrap: true, cell: (r) => r.description },
  {
    key: "users",
    header: "Jumlah Pengguna",
    align: "right",
    sort: (r) => r.users,
    cell: (r) => <span className="tabular">{r.users}</span>,
  },
  {
    key: "status",
    header: "Status",
    sort: (r) => r.status,
    cell: (r) => <span className={`badge ${BADGE[r.status]}`}>{r.status}</span>,
  },
]

export function RolesTable() {
  const [editing, setEditing] = useState<Role | null>(null)
  const [adding, setAdding] = useState(false)

  const rows = ROLES.map((r) => ({ ...r, users: userCount(r.name, USERS) }))

  const aksi: DataColumn<(typeof rows)[number]> = {
    key: "aksi",
    header: "Aksi",
    cell: (r) => (
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(r)}>
        Edit
      </button>
    ),
  }

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row">
          <h2 className="h5">Peran</h2>
          <span className="pill tabular">{rows.length} peran</span>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          + Tambah Peran
        </button>
      </div>

      <p className="body-sm text-muted">
        Peran yang masih dipakai pengguna tidak bisa dihapus, hanya dinonaktifkan. Kolom Jumlah
        Pengguna ada untuk itu.
      </p>

      <DataTable
        rows={rows}
        columns={[...COLUMNS, aksi]}
        rowKey={(r) => r.name}
        emptyText="Belum ada peran."
      />

      <RoleModal key="new" opened={adding} onClose={() => setAdding(false)} />
      <RoleModal
        key={editing?.name ?? "none"}
        opened={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
      />
    </section>
  )
}
