import { PageHeader } from "@/src/components/layout/PageHeader"
import { requirePermission } from "@/src/lib/auth/session"

import { ServiceBoard } from "./ServiceBoard"

export default async function ServicesPage() {
  await requirePermission("services")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Layanan Dokumen & Pemberkasan"
        subtitle="Status gerbang dihitung otomatis dari nominal pembayaran, tidak pernah diatur manual."
      />

      <ServiceBoard />
    </div>
  )
}
