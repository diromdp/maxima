import { PageHeader } from "@/src/components/layout/PageHeader"
import { requirePermission } from "@/src/lib/auth/session"

import { MonitoringTabs } from "./MonitoringTabs"

export default async function MonitoringPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  await requirePermission("monitoring")
  const { tab } = await searchParams

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Monitoring Akademik"
        subtitle="Menemukan yang tertinggal: pengajar, kelas, dan siswa. Seluruhnya dihitung dari data kelas, sesi, dan penilaian."
      />

      <MonitoringTabs initialTab={tab} />
    </div>
  )
}
