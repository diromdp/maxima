"use client"

import { Tooltip } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { QueryError } from "@/src/components/data/QueryError"
import { TableSkeleton } from "@/src/components/data/TableSkeleton"
import { deleteRole } from "@/src/entities/user/actions"
import { pagesQuery, rolesQuery } from "@/src/entities/user/queries"
import { ACCESS_GRANT, type RoleRow, type UserStatus } from "@/src/entities/user/schema"
import { useRead } from "@/src/lib/api/use-read"
import { notify } from "@/src/lib/notify"

import { RoleModal } from "./RoleModal"

const BADGE: Readonly<Record<UserStatus, string>> = {
  Aktif: "badge-beres",
  Nonaktif: "badge-tindakan",
}

const GRANT_NEEDED = "Mengatur peran butuh kewenangan Memberi hak akses dari super admin."
const KEY_ROLE_LOCKED = "Peran pemegang Memberi hak akses hanya dapat diubah super admin."
const ROLE_COLUMNS = 5

export function RolesTable({
  canEdit,
  canGrant,
  isSuperAdmin,
}: {
  canEdit: boolean
  canGrant: boolean
  isSuperAdmin: boolean
}) {
  const roles = useRead(rolesQuery())
  const pages = useRead(pagesQuery())
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<RoleRow | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const lockOf = (role: RoleRow): string | null => {
    if (!canGrant) return GRANT_NEEDED
    if (role.capabilities.includes(ACCESS_GRANT) && !isSuperAdmin) return KEY_ROLE_LOCKED
    return null
  }

  const confirmDelete = (role: RoleRow) =>
    modals.openConfirmModal({
      title: `Hapus peran ${role.name}?`,
      children: (
        <p className="body-sm">
          Peran yang masih dipakai pengguna tidak dapat dihapus; nonaktifkan saja lewat Edit.
        </p>
      ),
      labels: { confirm: "Hapus Peran", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        const result = await deleteRole(role.id)
        if (!result.ok) return notify.error(result.message)
        notify.success(`Peran ${role.name} dihapus.`)
        await queryClient.invalidateQueries({ queryKey: ["roles"] })
      },
    })

  const columns: readonly DataColumn<RoleRow>[] = [
    {
      key: "name",
      header: "Nama Peran",
      sort: (r) => r.name,
      cell: (r) => <span className="text-ink">{r.name}</span>,
    },
    { key: "description", header: "Deskripsi", wrap: true, cell: (r) => r.description ?? "-" },
    {
      key: "users",
      header: "Jumlah Pengguna",
      align: "right",
      sort: (r) => r.userCount,
      cell: (r) => <span className="tabular">{r.userCount}</span>,
    },
    {
      key: "status",
      header: "Status",
      sort: (r) => r.status,
      cell: (r) => <span className={`badge ${BADGE[r.status]}`}>{r.status}</span>,
    },
    ...(canEdit
      ? [
          {
            key: "aksi",
            header: "Aksi",
            cell: (r: RoleRow) => {
              const lock = lockOf(r)
              return (
                <Tooltip label={lock} disabled={lock === null} multiline w={240}>
                  <div className="row" style={{ gap: 4 }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={lock !== null}
                      onClick={() => setEditing(r)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={lock !== null}
                      onClick={() => confirmDelete(r)}
                    >
                      Hapus
                    </button>
                  </div>
                </Tooltip>
              )
            },
          },
        ]
      : []),
  ]

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row">
          <h2 className="h5">Peran</h2>
          {roles.data && <span className="pill tabular">{roles.data.meta.total} peran</span>}
        </div>
        {canEdit && (
          <Tooltip label={GRANT_NEEDED} disabled={canGrant} multiline w={260}>
            <span>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!canGrant}
                onClick={() => setIsAdding(true)}
              >
                + Tambah Peran
              </button>
            </span>
          </Tooltip>
        )}
      </div>

      <p className="body-sm text-muted">
        Peran yang masih dipakai pengguna tidak bisa dihapus, hanya dinonaktifkan. Kolom Jumlah
        Pengguna ada untuk itu.
      </p>

      {roles.isError ? (
        <QueryError message={roles.error.message} onRetry={() => void roles.refetch()} />
      ) : roles.isPending ? (
        <TableSkeleton columns={ROLE_COLUMNS} rows={7} />
      ) : (
        <DataTable
          rows={roles.data.data}
          columns={columns}
          rowKey={(r) => r.id}
          defaultSort={{ key: "name", dir: "asc" }}
          emptyText="Belum ada peran."
        />
      )}

      {isAdding && (
        <RoleModal
          pages={pages.data?.data ?? []}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setIsAdding(false)}
        />
      )}
      {editing && (
        <RoleModal
          key={editing.id}
          initial={editing}
          pages={pages.data?.data ?? []}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  )
}
