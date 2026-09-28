import { PageHeader } from "@/src/components/layout/PageHeader"
import { masterItemsQuery } from "@/src/entities/master-data/queries"
import { packagesQuery, PROMO_FILTERS, promosQuery } from "@/src/entities/package/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { PackagePromoTabs } from "./PackagePromoTabs"

export default async function PackagesPromosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requirePermission("packages-promos")
  const params = listParamsOf(searchParamsSource(await searchParams), PROMO_FILTERS)

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Master Paket & Promo"
        subtitle="Manajemen paket program belajar, sembilan gerbang pembayaran, dan diskon promosi siswa."
      />

      <Prefetched reads={[packagesQuery(), masterItemsQuery(), promosQuery(params)]}>
        <PackagePromoTabs readOnly={!canEdit(session.permissions, "packages-promos")} />
      </Prefetched>
    </div>
  )
}
