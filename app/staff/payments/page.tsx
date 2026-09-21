import { PageHeader } from "@/src/components/layout/PageHeader"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { PaymentsTable } from "./PaymentsTable"

const RATIFYING_ROLES = ["Manajer Finance", "Admission"]

export default async function PaymentsPage() {
  const session = await requirePermission("payments")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Konfirmasi Pembayaran"
        subtitle="Database seluruh transaksi pembayaran masuk yang divalidasi oleh Finance. Rupiah dan Euro tidak pernah dijumlahkan."
      />

      <PaymentsTable
        canRecord={canEdit(session.role, "payments")}
        canRatify={RATIFYING_ROLES.includes(session.role)}
      />
    </div>
  )
}
