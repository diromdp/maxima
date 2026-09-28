import { PageHeader } from "@/src/components/layout/PageHeader"
import { masterItemsQuery } from "@/src/entities/master-data/queries"
import { serviceBoardQuery, serviceOptionsQuery } from "@/src/entities/service/queries"
import { SERVICE_FILTERS } from "@/src/entities/service/schema"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { ServiceBoard } from "./ServiceBoard"

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requirePermission("services")
  const params = listParamsOf(searchParamsSource(await searchParams), SERVICE_FILTERS)

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Layanan Dokumen & Pemberkasan"
        subtitle="Status gerbang dihitung otomatis dari nominal pembayaran, tidak pernah diatur manual."
      />

      <Prefetched reads={[serviceBoardQuery(params), serviceOptionsQuery(), masterItemsQuery()]}>
        <ServiceBoard />
      </Prefetched>
    </div>
  )
}
