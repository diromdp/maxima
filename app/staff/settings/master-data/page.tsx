import { PageHeader } from "@/src/components/layout/PageHeader"
import { requirePermission } from "@/src/lib/auth/session"

import { MasterDataPanels } from "./MasterDataPanels"

export default async function MasterDataPage() {
  await requirePermission("settings-master-data")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Master Data"
        subtitle="Pilihan tetap yang dipakai formulir di seluruh sistem. Menghapus butir tidak mengubah data yang sudah memakainya."
      />

      <MasterDataPanels />
    </div>
  )
}
