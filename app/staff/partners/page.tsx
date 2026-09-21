import { PageHeader } from "@/src/components/layout/PageHeader"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { PartnerTabs } from "./PartnerTabs"

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await requirePermission("partners")
  const { tab } = await searchParams

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Partner"
        subtitle="Manajemen perusahaan Jerman, pengajuan kandidat, dan latihan wawancara."
      />

      <PartnerTabs initialTab={tab} readOnly={!canEdit(session.role, "partners")} />
    </div>
  )
}
