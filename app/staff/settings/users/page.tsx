import { PageHeader } from "@/src/components/layout/PageHeader"
import { requirePermission } from "@/src/lib/auth/session"

import { RolesTable } from "./RolesTable"
import { UsersTable } from "./UsersTable"

export default async function UsersPage() {
  await requirePermission("settings")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Pengguna & Hak Akses"
        subtitle="Kelola akun staf dan hak akses tiap peran. Perubahan di halaman ini selalu masuk Log Aktivitas."
      />

      <UsersTable />
      <RolesTable />
    </div>
  )
}
