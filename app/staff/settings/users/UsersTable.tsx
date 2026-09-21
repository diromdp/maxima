"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"

import { branchLabel, BRANCHES, ROLE_NAMES, type StaffUser, USERS, type UserStatus } from "./sample"
import { UserModal } from "./UserModal"

const BADGE: Readonly<Record<UserStatus, string>> = {
  Aktif: "badge-beres",
  Nonaktif: "badge-tindakan",
}

const ALL_BRANCHES = "Semua cabang"

const matches = (u: StaffUser, q: string) =>
  q === "" || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())

export function UsersTable() {
  const [query, setQuery] = useState("")
  const [role, setRole] = useState<string | null>(null)
  const [branch, setBranch] = useState<string | null>(null)
  const [editing, setEditing] = useState<StaffUser | null>(null)
  const [adding, setAdding] = useState(false)

  const rows = USERS.filter(
    (u) =>
      matches(u, query) &&
      (role === null || u.role === role) &&
      (branch === null ||
        (branch === ALL_BRANCHES ? u.branches === null : u.branches?.includes(branch))),
  )

  const columns: readonly DataColumn<StaffUser>[] = [
    {
      key: "name",
      header: "Nama",
      sort: (u) => u.name,
      cell: (u) => <span className="text-ink">{u.name}</span>,
    },
    { key: "email", header: "Email", sort: (u) => u.email, cell: (u) => u.email },
    {
      key: "role",
      header: "Peran",
      sort: (u) => u.role,
      cell: (u) => <span className="badge">{u.role}</span>,
    },
    {
      key: "branch",
      header: "Cabang",
      sort: (u) => branchLabel(u.branches),
      cell: (u) => branchLabel(u.branches),
    },
    {
      key: "status",
      header: "Status",
      sort: (u) => u.status,
      cell: (u) => <span className={`badge ${BADGE[u.status]}`}>{u.status}</span>,
    },
    {
      key: "aksi",
      header: "Aksi",
      cell: (u) => (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(u)}>
          Edit
        </button>
      ),
    },
  ]

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row">
          <h2 className="h5">Pengguna</h2>
          <span className="pill tabular">{rows.length} pengguna</span>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          + Tambah Pengguna
        </button>
      </div>

      <div className="grid-3">
        <TextInput
          aria-label="Cari pengguna"
          placeholder="Cari nama atau email"
          leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
        <Select
          aria-label="Saring peran"
          placeholder="Semua peran"
          data={[...ROLE_NAMES]}
          value={role}
          onChange={setRole}
          clearable
        />
        <Select
          aria-label="Saring cabang"
          placeholder="Semua cabang"
          data={[ALL_BRANCHES, ...BRANCHES]}
          value={branch}
          onChange={setBranch}
          clearable
        />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(u) => u.id}
        defaultSort={{ key: "name", dir: "asc" }}
        emptyText="Tidak ada pengguna yang cocok dengan saringan."
      />

      <UserModal opened={adding} onClose={() => setAdding(false)} />
      <UserModal
        key={editing?.id ?? "none"}
        opened={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
      />
    </section>
  )
}
