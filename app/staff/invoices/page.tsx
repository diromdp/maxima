import { PageHeader } from "@/src/components/layout/PageHeader"
import { requirePermission } from "@/src/lib/auth/session"

import { InvoiceTabs } from "./InvoiceTabs"

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  await requirePermission("invoices")
  const { tab } = await searchParams

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Tagihan & Piutang"
        subtitle="Pantau kekurangan pembayaran, tagihan jatuh tempo, dan riwayat pengiriman pengingat. Seluruhnya hitungan dari paket dan transaksi."
      />

      <InvoiceTabs initialTab={tab} />
    </div>
  )
}
