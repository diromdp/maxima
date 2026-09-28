import { PageHeader } from "@/src/components/layout/PageHeader"
import {
  branchesQuery,
  pagesQuery,
  rolesQuery,
  USER_FILTERS,
  usersQuery,
} from "@/src/entities/user/queries"
import { ACCESS_GRANT } from "@/src/entities/user/schema"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { hasCapability, requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { RolesTable } from "./RolesTable"
import { UsersTable } from "./UsersTable"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requirePermission("settings")
  const params = listParamsOf(searchParamsSource(await searchParams), USER_FILTERS)
  const access = {
    canEdit: canEdit(session.permissions, "settings"),
    canGrant: hasCapability(session, ACCESS_GRANT),
    isSuperAdmin: session.isSuperAdmin,
  }

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Pengguna & Hak Akses"
        subtitle="Kelola akun staf dan hak akses tiap peran. Perubahan di halaman ini selalu masuk Log Aktivitas."
      />

      <Prefetched reads={[usersQuery(params), rolesQuery(), pagesQuery(), branchesQuery()]}>
        <UsersTable {...access} selfId={session.id} />
        <RolesTable {...access} />
      </Prefetched>
    </div>
  )
}
