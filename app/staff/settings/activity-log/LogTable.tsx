"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { formatDateTime } from "@/src/lib/format"

import { isCrossArea, LOG, type LogEntry, type Module, MODULES, USERS } from "./sample"

const MODULE_BADGE: Readonly<Record<Module, string>> = {
  Partner: "badge-terbuka",
  Admission: "badge-berjalan",
  Finance: "badge-beres",
  Akademik: "badge-terkunci",
  Dokumen: "badge-terbuka",
  Pengaturan: "badge-tindakan",
}

const COLUMNS: readonly DataColumn<LogEntry>[] = [
  {
    key: "at",
    header: "Timestamp",
    sort: (l) => l.at,
    cell: (l) => <span className="tabular text-muted">{formatDateTime(l.at)}</span>,
  },
  {
    key: "user",
    header: "User",
    sort: (l) => l.user,
    cell: (l) => (
      <div className="stack" style={{ gap: 0 }}>
        <span className="text-ink">{l.user}</span>
        <span className="caption text-muted">{l.role}</span>
      </div>
    ),
  },
  {
    key: "action",
    header: "Aksi Aktivitas",
    wrap: true,
    cell: (l) => (
      <div className="stack" style={{ gap: 4, alignItems: "flex-start" }}>
        <span>{l.action}</span>
        {isCrossArea(l) && (
          <span className="badge badge-berjalan" title="Admission mengubah data di luar wilayahnya">
            Lintas wilayah
          </span>
        )}
      </div>
    ),
  },
  {
    key: "module",
    header: "Modul",
    sort: (l) => l.module,
    cell: (l) => <span className={`badge ${MODULE_BADGE[l.module]}`}>{l.module}</span>,
  },
  {
    key: "ip",
    header: "IP Address",
    sort: (l) => l.ip,
    cell: (l) => <span className="tabular text-muted">{l.ip}</span>,
  },
]

const matches = (l: LogEntry, q: string) =>
  q === "" || `${l.action} ${l.user}`.toLowerCase().includes(q.toLowerCase())

export function LogTable() {
  const [query, setQuery] = useState("")
  const [user, setUser] = useState<string | null>(null)
  const [module, setModule] = useState<string | null>(null)

  const rows = LOG.filter(
    (l) =>
      matches(l, query) &&
      (user === null || l.user === user) &&
      (module === null || l.module === module),
  )

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row">
          <h2 className="h5">Rekaman</h2>
          <span className="pill tabular">{rows.length} aktivitas</span>
        </div>
        <span className="caption text-muted">Log tidak dapat dihapus oleh siapa pun.</span>
      </div>

      <div className="grid-3">
        <TextInput
          aria-label="Cari aktivitas"
          placeholder="Cari aktivitas atau nama"
          leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
        <Select
          aria-label="Saring user"
          placeholder="Semua user"
          data={[...USERS]}
          value={user}
          onChange={setUser}
          clearable
        />
        <Select
          aria-label="Saring modul"
          placeholder="Semua modul"
          data={[...MODULES]}
          value={module}
          onChange={setModule}
          clearable
        />
      </div>

      <DataTable
        rows={rows}
        columns={COLUMNS}
        rowKey={(l) => l.id}
        defaultSort={{ key: "at", dir: "desc" }}
        emptyText="Tidak ada aktivitas yang cocok dengan saringan."
      />
    </section>
  )
}
