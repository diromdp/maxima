import { PageHeader } from "@/src/components/layout/PageHeader"
import { systemSettingsQuery } from "@/src/entities/settings/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { PaymentGatewaySetting } from "./PaymentGatewaySetting"

export default async function PaymentGatewayPage() {
  const session = await requirePermission("settings")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Payment Gateway"
        subtitle="Atur apakah siswa dapat membayar online lewat QRIS dan Transfer VA di halaman Pembayaran portal."
      />

      <Prefetched reads={[systemSettingsQuery()]}>
        <PaymentGatewaySetting canEdit={canEdit(session.permissions, "settings")} />
      </Prefetched>
    </div>
  )
}
