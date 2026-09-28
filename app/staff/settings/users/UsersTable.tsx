"use client"

import { Tooltip } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { QueryError } from "@/src/components/data/QueryError"
import { ServerDataTable } from "@/src/components/data/ServerDataTable"
import type { DataColumn } from "@/src/components/data/TableFrame"
import { deleteUser } from "@/src/entities/user/actions"
import { branchesQuery, rolesQuery, USER_FILTERS, usersQuery } from "@/src/entities/user/queries"
import { ACCESS_GRANT, type UserRow, type UserStatus } from "@/src/entities/user/schema"
import { useRead } from "@/src/lib/api/use-read"
import { notify } from "@/src/lib/notify"
import { useListParams } from "@/src/lib/use-list-params"

import { UserModal } from "./UserModal"

const BADGE: Readonly<Record<UserStatus, string>> = {
  Aktif: "badge-beres",
  Nonaktif: "badge-tindakan",
}

const GRANT_NEEDED =
  "Menambah pengguna menugaskan peran, jadi butuh kewenangan Memberi hak akses dari super admin."
const KEY_HOLDER_LOCKED = "Pemegang Memberi hak akses hanya dapat diubah super admin."

export function UsersTable({
  canEdit,
  canGrant,
  isSuperAdmin,
  selfId,
}: {
  canEdit: boolean
  canGrant: boolean
  isSuperAdmin: boolean
  selfId: string
}) {
  const queryClient = useQueryClient()
  const { params } = useListParams(USER_FILTERS)
  const users = useRead(usersQuery(params))
  const roles = useRead(rolesQuery())
  const branches = useRead(branchesQuery())
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const confirmDelete = (user: UserRow) =>
    modals.openConfirmModal({
      title: `Hapus pengguna ${user.name}?`,
      children: (
        <p className="body-sm">
          Hanya pengguna yang belum tercatat di data mana pun yang dapat dihapus. Yang sudah pernah
          bekerja di sistem cukup dinonaktifkan lewat Edit.
        </p>
      ),
      labels: { confirm: "Hapus Pengguna", cancel: "Batal" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        const result = await deleteUser(user.id)
        if (!result.ok) return notify.error(result.message)
        notify.success(`Pengguna ${user.name} dihapus.`)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["users"] }),
          queryClient.invalidateQueries({ queryKey: ["roles"] }),
        ])
      },
    })

  const keyHolderRoles = new Set(
    (roles.data?.data ?? [])
      .filter((role) => role.capabilities.includes(ACCESS_GRANT))
      .map((role) => role.id),
  )

  const columns: readonly DataColumn<UserRow>[] = [
    { key: "name", header: "Nama", cell: (u) => <span className="text-ink">{u.name}</span> },
    { key: "email", header: "Email", cell: (u) => u.email },
    {
      key: "role",
      header: "Peran",
      cell: (u) => (
        <span className="badge">{u.isSuperAdmin ? "Super Admin" : (u.role?.name ?? "-")}</span>
      ),
    },
    {
      key: "branch",
      header: "Cabang",
      cell: (u) =>
        u.branches.length === 0 ? "Semua cabang" : u.branches.map((b) => b.name).join(", "),
    },
    {
      key: "status",
      header: "Status",
      cell: (u) => <span className={`badge ${BADGE[u.status]}`}>{u.status}</span>,
    },
    ...(canEdit
      ? [
          {
            key: "aksi",
            header: "Aksi",
            cell: (u: UserRow) => {
              if (u.isSuperAdmin) return null
              const isLocked = !isSuperAdmin && u.role !== null && keyHolderRoles.has(u.role.id)
              return (
                <Tooltip label={KEY_HOLDER_LOCKED} disabled={!isLocked} multiline w={240}>
                  <div className="row" style={{ gap: 4 }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={isLocked}
                      onClick={() => setEditing(u)}
                    >
                      Edit
                    </button>
                    {u.id !== selfId && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={isLocked}
                        onClick={() => confirmDelete(u)}
                      >
                        Hapus
                      </button>
                    )}
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
          <h2 className="h5">Pengguna</h2>
          {users.data && <span className="pill tabular">{users.data.meta.total} pengguna</span>}
        </div>
        {canEdit && (
          <Tooltip label={GRANT_NEEDED} disabled={canGrant} multiline w={260}>
            <span>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!canGrant}
                onClick={() => setIsAdding(true)}
              >
                + Tambah Pengguna
              </button>
            </span>
          </Tooltip>
        )}
      </div>

      <div className="row row-wrap" style={{ gap: 8 }}>
        <ListSearch label="Cari nama atau email" />
        <ListFilter
          name="role"
          label="peran"
          options={(roles.data?.data ?? []).map((role) => ({ value: role.id, label: role.name }))}
        />
        <ListFilter
          name="branch"
          label="cabang"
          options={(branches.data?.data ?? []).map((branch) => ({
            value: branch.id,
            label: branch.name,
          }))}
        />
      </div>

      {users.isError ? (
        <QueryError message={users.error.message} onRetry={() => void users.refetch()} />
      ) : (
        <ServerDataTable
          rows={users.data?.data ?? []}
          total={users.data?.meta.total ?? 0}
          isPending={users.isPending}
          columns={columns}
          rowKey={(u) => u.id}
          emptyText="Tidak ada pengguna yang cocok dengan saringan."
        />
      )}

      {isAdding && (
        <UserModal
          roles={roles.data?.data ?? []}
          branches={branches.data?.data ?? []}
          canGrant={canGrant}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setIsAdding(false)}
        />
      )}
      {editing && (
        <UserModal
          key={editing.id}
          initial={editing}
          roles={roles.data?.data ?? []}
          branches={branches.data?.data ?? []}
          canGrant={canGrant}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  )
}
