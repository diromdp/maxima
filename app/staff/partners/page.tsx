import { PageHeader } from "@/src/components/layout/PageHeader"
import { masterItemsQuery } from "@/src/entities/master-data/queries"
import {
  applicationsQuery,
  partnersQuery,
  practicesQuery,
  trackingQuery,
} from "@/src/entities/partner/queries"
import {
  APPLICATION_FILTERS,
  applicationFiltersOf,
  PARTNER_FILTERS,
  partnerFiltersOf,
  PRACTICE_FILTERS,
  practiceFiltersOf,
} from "@/src/entities/partner/schema"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { PartnerTabs } from "./PartnerTabs"

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requirePermission("partners")
  const source = searchParamsSource(await searchParams)
  const tab = source.get("tab")
  const read =
    tab === "applications"
      ? applicationsQuery(applicationFiltersOf(listParamsOf(source, APPLICATION_FILTERS)))
      : tab === "practice"
        ? practicesQuery(practiceFiltersOf(listParamsOf(source, PRACTICE_FILTERS)))
        : tab === "tracking"
          ? trackingQuery(applicationFiltersOf(listParamsOf(source, APPLICATION_FILTERS)))
          : partnersQuery(partnerFiltersOf(listParamsOf(source, PARTNER_FILTERS)))

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Partner"
        subtitle="Manajemen perusahaan Jerman, pengajuan kandidat, dan latihan wawancara."
      />

      <Prefetched reads={[read, partnersQuery(), masterItemsQuery()]}>
        <PartnerTabs readOnly={!canEdit(session.permissions, "partners")} />
      </Prefetched>
    </div>
  )
}
