"use client"

import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { modals } from "@mantine/modals"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { QueryError } from "@/src/components/data/QueryError"
import { SkeletonRows } from "@/src/components/data/SkeletonRows"
import { removeClass } from "@/src/entities/class/actions"
import { classesQuery } from "@/src/entities/class/queries"
import {
  capacityLabel,
  CLASS_FILTERS,
  CLASS_STATUSES,
  classFiltersOf,
  type ClassRow,
  type ClassStatus,
} from "@/src/entities/class/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"
import { useListParams } from "@/src/lib/use-list-params"

import { ClassFormModal } from "./ClassFormModal"
import { useMasterOptions } from "@/src/entities/master-data/use-master-options"

const SKELETON_ROWS = 5
const COLUMN_COUNT = 10

export const CLASS_STATUS_BADGE: Readonly<Record<ClassStatus, string>> = {
  Draft: "badge-terkunci",
  Aktif: "badge-beres",
  Ditutup: "badge-neutral-solid",
}

const isFull = (room: ClassRow) => room.memberCount >= room.capacity

function useConfirmDelete() {
  const queryClient = useQueryClient()

  return (room: ClassRow) =>
    room.memberCount > 0
      ? modals.open({
          title: `${room.name} tidak dapat dihapus`,
          children: (
            <div className="stack">
              <p className="body-sm">
                {room.name} masih punya {room.memberCount} siswa aktif. Pindahkan atau keluarkan
                siswanya dulu di tab Anggota Kelas, atau ubah status kelas jadi Ditutup.
              </p>
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => modals.closeAll()}
                >
                  Tutup
                </button>
              </div>
            </div>
          ),
        })
      : modals.openConfirmModal({
          title: `Hapus ${room.name}?`,
          children: (
            <p className="body-sm">
              {room.name} hilang dari daftar kelas beserta jadwalnya. Kelas yang sudah punya sesi
              atau absensi tercatat tidak dapat dihapus, hanya ditutup. Tindakan ini tidak bisa
              dibatalkan.
            </p>
          ),
          labels: { confirm: "Hapus", cancel: "Batal" },
          confirmProps: { color: "red" },
          onConfirm: async () => {
            const result = await removeClass(room.id)
            if (!result.ok) return notify.error(result.message)
            notify.success(`${room.name} dihapus.`)
            await Promise.all(
              [["classes"], ["class-calendar"], ["kkm-standards"]].map((queryKey) =>
                queryClient.invalidateQueries({ queryKey }),
              ),
            )
          },
        })
}

function columnsFor(
  canEdit: boolean,
  onEdit: (room: ClassRow) => void,
  onDelete: (room: ClassRow) => void,
): readonly DataColumn<ClassRow>[] {
  const columns: DataColumn<ClassRow>[] = [
    {
      key: "name",
      header: "Nama Kelas",
      sort: (room) => room.name,
      cell: (room) => <span style={{ fontWeight: 600 }}>{room.name}</span>,
    },
    {
      key: "level",
      header: "Level",
      sort: (room) => room.level.name,
      cell: (room) => room.level.name,
    },
    {
      key: "branch",
      header: "Cabang",
      sort: (room) => room.branch.name,
      cell: (room) => room.branch.name,
    },
    {
      key: "teacher",
      header: "Pengajar",
      sort: (room) => room.teacher?.name ?? "",
      cell: (room) => room.teacher?.name ?? <span className="text-faint">Belum ada</span>,
    },
    {
      key: "capacity",
      header: "Kapasitas",
      sort: (room) => room.memberCount / room.capacity,
      cell: (room) => (
        <span
          className={`tabular${isFull(room) ? " text-danger" : ""}`}
          title={isFull(room) ? "Kelas penuh" : undefined}
        >
          {capacityLabel(room)}
        </span>
      ),
    },
    { key: "schedule", header: "Jadwal", cell: (room) => room.schedule },
    {
      key: "start",
      header: "Mulai",
      sort: (room) => room.startDate,
      cell: (room) => <span className="tabular">{formatDate(room.startDate)}</span>,
    },
    {
      key: "end",
      header: "Selesai",
      sort: (room) => room.endDate,
      cell: (room) => <span className="tabular">{formatDate(room.endDate)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sort: (room) => room.status,
      cell: (room) => (
        <span className={`badge ${CLASS_STATUS_BADGE[room.status]}`}>{room.status}</span>
      ),
    },
  ]
  if (!canEdit) return columns
  return [
    ...columns,
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
            title={room.memberCount > 0 ? "Kelas berisi siswa tidak dapat dihapus" : "Hapus"}
            onClick={() => onDelete(room)}
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.5} />
          </button>
        </div>
      ),
    },
  ]
}

export function MasterClassTable({ canEdit }: { canEdit: boolean }) {
  const { params, setParams } = useListParams(CLASS_FILTERS)
  const filters = classFiltersOf(params)
  const classes = useRead(classesQuery(filters))
  const { branches, levels } = useMasterOptions()
  const [editing, setEditing] = useState<ClassRow | null>(null)
  const confirmDelete = useConfirmDelete()

  const isFiltered = Object.values(filters).some(Boolean)

  return (
    <section className="card stack">
      <div className="row row-wrap" style={{ gap: 8 }}>
        <ListSearch label="Cari nama kelas atau pengajar" />
        <ListFilter name="branch" label="Cabang" options={branches} />
        <ListFilter name="level" label="Level" options={levels} />
        <ListFilter
          name="status"
          label="Status"
          options={CLASS_STATUSES.map((status) => ({ value: status, label: status }))}
        />
        <div className="row" style={{ gap: 8, marginInlineStart: "auto" }}>
          {classes.isSuccess && (
            <span className="caption text-muted tabular">{classes.data.data.length} kelas</span>
          )}
          {isFiltered && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setParams({ search: null, branch: null, level: null, status: null })}
            >
              Hapus saringan
            </button>
          )}
        </div>
      </div>

      {classes.isError ? (
        <QueryError message={classes.error.message} onRetry={() => void classes.refetch()} />
      ) : classes.isPending ? (
        <ClassTableSkeleton />
      ) : (
        <DataTable
          rows={classes.data.data}
          columns={columnsFor(canEdit, setEditing, confirmDelete)}
          rowKey={(room) => room.id}
          emptyText={
            isFiltered
              ? "Tidak ada kelas yang cocok dengan pencarian atau saringan."
              : "Belum ada kelas. Tambahkan lewat tombol Tambah Kelas."
          }
        />
      )}

      {editing && <ClassFormModal initial={editing} onClose={() => setEditing(null)} />}
    </section>
  )
}

export function ClassTableSkeleton() {
  return (
    <div className="table-scroll" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <table className="table">
        <tbody>
          <SkeletonRows columns={COLUMN_COUNT} rows={SKELETON_ROWS} />
        </tbody>
      </table>
    </div>
  )
}
