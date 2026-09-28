import { PageHeader } from "@/src/components/layout/PageHeader"
import { paymentsQuery, pendingPaymentsQuery } from "@/src/entities/payment/queries"
import { PAYMENT_FILTERS } from "@/src/entities/payment/schema"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { canEdit } from "@/src/lib/auth/permissions"
import { hasCapability, requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { PaymentsTable } from "./PaymentsTable"

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requirePermission("payments")
  const params = listParamsOf(searchParamsSource(await searchParams), PAYMENT_FILTERS)
  const canRecord = canEdit(session.permissions, "payments")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Konfirmasi Pembayaran"
        subtitle="Database seluruh transaksi pembayaran masuk yang divalidasi oleh Finance. Rupiah dan Euro tidak pernah dijumlahkan."
      />

      <Prefetched reads={[paymentsQuery(params), pendingPaymentsQuery()]}>
        <PaymentsTable
          canRecord={canRecord}
          canRatify={canRecord && hasCapability(session, "payments.ratify")}
          viewerId={session.id}
        />
      </Prefetched>
    </div>
  )
}
