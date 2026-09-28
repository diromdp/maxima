import { PageHeader } from "@/src/components/layout/PageHeader"
import { dueQuery, receivablesQuery, remindersQuery } from "@/src/entities/invoice/queries"
import { DUE_FILTERS, RECEIVABLE_FILTERS, REMINDER_FILTERS } from "@/src/entities/invoice/schema"
import { masterItemsQuery } from "@/src/entities/master-data/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { InvoiceTabs } from "./InvoiceTabs"

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requirePermission("invoices")
  const source = searchParamsSource(await searchParams)
  const tab = source.get("tab")
  const read =
    tab === "due"
      ? dueQuery(listParamsOf(source, DUE_FILTERS))
      : tab === "reminders"
        ? remindersQuery(listParamsOf(source, REMINDER_FILTERS))
        : receivablesQuery(listParamsOf(source, RECEIVABLE_FILTERS))

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Tagihan & Piutang"
        subtitle="Pantau kekurangan pembayaran, tagihan jatuh tempo, dan riwayat pengiriman pengingat. Seluruhnya hitungan dari paket dan transaksi."
      />

      <Prefetched reads={[read, masterItemsQuery()]}>
        <InvoiceTabs />
      </Prefetched>
    </div>
  )
}
