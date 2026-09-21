import { PageHeader } from "@/src/components/layout/PageHeader"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { AddClassButton } from "./AddClassButton"
import { ClassTabs } from "./ClassTabs"

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await requirePermission("classes")
  const { tab } = await searchParams

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Kelas & Jadwal"
        subtitle="Manajemen daftar kelas, level bahasa, pengajar, dan alokasi kapasitas siswa."
        actions={<AddClassButton />}
      />

      <ClassTabs initialTab={tab} canEditKkm={canEdit(session.role, "classes")} />
    </div>
  )
}
