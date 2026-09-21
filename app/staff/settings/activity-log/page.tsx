import { PageHeader } from "@/src/components/layout/PageHeader"
import { requirePermission } from "@/src/lib/auth/session"

import { LogTable } from "./LogTable"

export default async function ActivityLogPage() {
  await requirePermission("settings-activity-log")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Log Aktivitas"
        subtitle="Rekaman aktivitas pengguna untuk keperluan audit dan penelusuran data. Perubahan Admission di wilayah Finance dan Akademik ditandai khusus."
      />

      <LogTable />
    </div>
  )
}
