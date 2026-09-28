import { PageHeader } from "@/src/components/layout/PageHeader"
import { masterItemsQuery } from "@/src/entities/master-data/queries"
import { placementsQuery } from "@/src/entities/placement/queries"
import { PLACEMENT_FILTERS } from "@/src/entities/placement/schema"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { AlumniTable } from "./AlumniTable"

export default async function VisaPlacementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requirePermission("visa-placement")
  const params = listParamsOf(searchParamsSource(await searchParams), PLACEMENT_FILTERS)

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Visa & Penempatan"
        subtitle="Data visa, kontrak kerja, dan keberangkatan kandidat menuju Jerman. Mengisi tanggal keberangkatan menyalakan status Alumni."
      />

      <Prefetched reads={[placementsQuery(params), masterItemsQuery()]}>
        <AlumniTable />
      </Prefetched>
    </div>
  )
}
