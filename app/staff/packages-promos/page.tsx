import { PageHeader } from "@/src/components/layout/PageHeader"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { PackagePromoTabs } from "./PackagePromoTabs"

export default async function PackagesPromosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await requirePermission("packages-promos")
  const { tab } = await searchParams

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Master Paket & Promo"
        subtitle="Manajemen paket program belajar, sembilan gerbang pembayaran, dan diskon promosi siswa."
      />

      <PackagePromoTabs initialTab={tab} readOnly={!canEdit(session.role, "packages-promos")} />
    </div>
  )
}
