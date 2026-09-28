import { PageHeader } from "@/src/components/layout/PageHeader"
import {
  contentsQuery,
  documentTypesQuery,
  holidaysQuery,
  masterItemsQuery,
} from "@/src/entities/master-data/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { MasterDataPanels } from "./MasterDataPanels"

export default async function MasterDataPage() {
  const session = await requirePermission("settings-master-data")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Master Data"
        subtitle="Pilihan tetap yang dipakai formulir di seluruh sistem. Butir yang sudah dipakai data lain tidak dapat dihapus, hanya dinonaktifkan."
      />

      <Prefetched
        reads={[masterItemsQuery(), documentTypesQuery(), holidaysQuery(), contentsQuery()]}
      >
        <MasterDataPanels canEdit={canEdit(session.permissions, "settings-master-data")} />
      </Prefetched>
    </div>
  )
}
