"use client"

import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { modals } from "@mantine/modals"
import { useQueryClient, type QueryKey } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { QueryError } from "@/src/components/data/QueryError"
import { TableSkeleton } from "@/src/components/data/TableSkeleton"
import { removeMasterRecord, type MasterResource } from "@/src/entities/master-data/actions"
import type { MasterStatus } from "@/src/entities/master-data/schema"
import { notify } from "@/src/lib/notify"

const SKELETON_ROWS = 5

export function StatusText({ status }: { status: MasterStatus }) {
  return status === "Aktif" ? (
    <span className="caption text-faint">Aktif</span>
  ) : (
    <span className="badge badge-tindakan">Nonaktif</span>
  )
}

export type ModalRender<T> = (initial: T | undefined, onClose: () => void) => React.ReactNode

export function MasterPanel<T extends { id: string }>({
  title,
  unit,
  note,
  rows,
  error,
  onRetry,
  columns,
  rowName,
  canEdit,
  resource,
  invalidates,
  renderModal,
  hasRowActions = true,
}: {
  title: string
  unit: string
  note?: string
  rows: readonly T[] | undefined
  error: Error | null
  onRetry: () => void
  columns: readonly DataColumn<T>[]
  rowName: (row: T) => string
  canEdit: boolean
  resource: MasterResource
  invalidates: QueryKey
  renderModal: ModalRender<T>
  hasRowActions?: boolean
}) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<T | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const close = () => {
    setEditing(null)
    setIsAdding(false)
  }

  const numberOf = useMemo(() => new Map(rows?.map((row, index) => [row.id, index + 1])), [rows])

  const confirmDelete = (row: T) =>
    modals.openConfirmModal({
      title: `Hapus ${rowName(row)}?`,
      children: (
        <p className="body-sm">
          {rowName(row)} dihapus dari daftar {unit} dan tidak lagi dapat dipilih di formulir. Yang
          sudah dipakai data lain tidak dapat dihapus; nonaktifkan saja lewat Ubah.
        </p>
      ),
      labels: { confirm: "Hapus", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        const result = await removeMasterRecord(resource, row.id)
        if (!result.ok) return notify.error(result.message)
        notify.success(`${rowName(row)} dihapus.`)
        await queryClient.invalidateQueries({ queryKey: invalidates })
      },
    })

  const tableColumns: readonly DataColumn<T>[] = [
    {
      key: "no",
      header: "No",
      cell: (row) => <span className="text-faint tabular">{numberOf.get(row.id)}</span>,
    },
    ...columns,
    ...(canEdit && hasRowActions
      ? [
          {
            key: "aksi",
            header: "Aksi",
            cell: (row: T) => (
              <div className="row text-faint" style={{ gap: 0 }}>
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
            ),
          },
        ]
      : []),
  ]

  return (
    <section className="card stack">
      <div className="row row-between">
        <div className="row" style={{ minWidth: 0, gap: 8 }}>
          <h2 className="h6">{title}</h2>
          {rows && <span className="caption text-faint tabular">{rows.length}</span>}
        </div>
        {canEdit && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            aria-label={`Tambah ${unit}`}
            onClick={() => setIsAdding(true)}
          >
            + Tambah
          </button>
        )}
      </div>

      {note && <p className="body-sm text-muted">{note}</p>}

      {error ? (
        <QueryError message={error.message} onRetry={onRetry} />
      ) : rows === undefined ? (
        <TableSkeleton columns={tableColumns.length} rows={SKELETON_ROWS} />
      ) : (
        <DataTable
          rows={rows}
          columns={tableColumns}
          rowKey={(row) => row.id}
          emptyText={`Belum ada ${unit}.`}
        />
      )}

      {isAdding && renderModal(undefined, close)}
      {editing && renderModal(editing, close)}
    </section>
  )
}
