"use client"

import { Delete02Icon, PencilEdit02Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { ClassFormModal } from "./ClassFormModal"
import {
  BRANCHES,
  capacityLabel,
  CLASS_STATUS_BADGE,
  CLASS_STATUSES,
  CLASSES,
  type ClassRoom,
  isFull,
  LEVELS,
  scheduleLabel,
} from "./sample"

const FILTERS = [
  { key: "branch", label: "Cabang", options: BRANCHES },
  { key: "level", label: "Level", options: LEVELS },
  { key: "status", label: "Status", options: CLASS_STATUSES },
] as const

type FilterKey = (typeof FILTERS)[number]["key"]
type Filters = Readonly<Partial<Record<FilterKey, string>>>

const matchesQuery = (room: ClassRoom, query: string) =>
  query === "" || `${room.name} ${room.teacher}`.toLowerCase().includes(query.toLowerCase())

const matchesFilters = (room: ClassRoom, filters: Filters) =>
  FILTERS.every(({ key }) => !filters[key] || room[key] === filters[key])

const confirmDelete = (room: ClassRoom) =>
  modals.openConfirmModal({
    title: `Hapus ${room.name}?`,
    children: `${room.name} hilang dari daftar kelas beserta jadwalnya. ${room.enrolled} siswa di dalamnya kehilangan kelas dan perlu ditempatkan ulang. Tindakan ini tidak bisa dibatalkan.`,
    labels: { confirm: "Hapus", cancel: "Batal" },
    confirmProps: { color: "red" },
    onConfirm: () => notify.success(`${room.name} dihapus.`),
  })

const columnsFor = (onEdit: (room: ClassRoom) => void): readonly DataColumn<ClassRoom>[] => [
  {
    key: "name",
    header: "Nama Kelas",
    sort: (room) => room.name,
    cell: (room) => <span style={{ fontWeight: 600 }}>{room.name}</span>,
  },
  { key: "level", header: "Level", sort: (room) => room.level, cell: (room) => room.level },
  { key: "branch", header: "Cabang", sort: (room) => room.branch, cell: (room) => room.branch },
  {
    key: "teacher",
    header: "Pengajar",
    sort: (room) => room.teacher,
    cell: (room) => room.teacher,
  },
  {
    key: "capacity",
    header: "Kapasitas",
    sort: (room) => room.enrolled / room.capacity,
    cell: (room) => (
      <span
        className={`tabular${isFull(room) ? " text-danger" : ""}`}
        title={isFull(room) ? "Kelas penuh" : undefined}
      >
        {capacityLabel(room)}
      </span>
    ),
  },
  { key: "schedule", header: "Jadwal", cell: (room) => scheduleLabel(room) },
  {
    key: "start",
    header: "Mulai",
    sort: (room) => room.start,
    cell: (room) => <span className="tabular">{formatDate(room.start)}</span>,
  },
  {
    key: "end",
    header: "Selesai",
    sort: (room) => room.end,
    cell: (room) => <span className="tabular">{formatDate(room.end)}</span>,
  },
  {
    key: "status",
    header: "Status",
    sort: (room) => room.status,
    cell: (room) => (
      <span className={`badge ${CLASS_STATUS_BADGE[room.status]}`}>{room.status}</span>
    ),
  },
  {
    key: "actions",
    header: "Aksi",
    align: "right",
    cell: (room) => (
      <div className="row text-faint" style={{ gap: 0, justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn btn-ghost btn-icon btn-sm"
          aria-label={`Ubah ${room.name}`}
          title="Ubah"
          onClick={() => onEdit(room)}
        >
          <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-icon btn-sm"
          aria-label={`Hapus ${room.name}`}
          title="Hapus"
          onClick={() => confirmDelete(room)}
        >
          <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.5} />
        </button>
      </div>
    ),
  },
]

export function MasterClassTable() {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<Filters>({})
  const [editing, setEditing] = useState<ClassRoom | null>(null)

  const rows = CLASSES.filter((room) => matchesQuery(room, query) && matchesFilters(room, filters))
  const isFiltered = query !== "" || Object.values(filters).some(Boolean)

  return (
    <section className="card stack">
      <div className="row row-wrap" style={{ gap: 8 }}>
        <TextInput
          aria-label="Cari nama kelas atau pengajar"
          placeholder="Cari nama kelas atau pengajar"
          size="sm"
          leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          style={{ flex: "1 1 240px", maxWidth: 320 }}
        />
        {FILTERS.map(({ key, label, options }) => (
          <Select
            key={key}
            aria-label={`Saring ${label}`}
            placeholder={`Semua ${label}`}
            size="sm"
            w={160}
            comboboxProps={{ width: 200, position: "bottom-start" }}
            data={[...options]}
            value={filters[key] ?? null}
            onChange={(value) =>
              setFilters((current) => ({ ...current, [key]: value ?? undefined }))
            }
            clearable
          />
        ))}
        <div className="row" style={{ gap: 8, marginInlineStart: "auto" }}>
          <span className="caption text-muted tabular">
            {isFiltered ? `${rows.length} dari ${CLASSES.length} kelas` : `${CLASSES.length} kelas`}
          </span>
          {isFiltered && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setFilters({})
                setQuery("")
              }}
            >
              Hapus saringan
            </button>
          )}
        </div>
      </div>

      <DataTable
        rows={rows}
        columns={columnsFor(setEditing)}
        rowKey={(room) => room.id}
        emptyText="Tidak ada kelas yang cocok dengan pencarian atau saringan."
      />

      <ClassFormModal
        key={`edit-${editing?.id ?? "none"}`}
        opened={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
      />
    </section>
  )
}
