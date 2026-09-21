import { PageHeader } from "@/src/components/layout/PageHeader"
import { requireSession } from "@/src/lib/auth/session"
import { formatDate } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"

import { EuroObligation } from "./EuroObligation"
import { PaymentHistory } from "./PaymentHistory"
import { PaymentPlanner } from "./PaymentPlanner"
import {
  DUE_DAY,
  INSTALLMENT_COUNT,
  monthlyTarget,
  nextDueDate,
  nextInstallmentNumber,
  PACKAGE_NAME,
  PACKAGE_PRICE,
  PACKAGE_PRICE_EUR,
  paidPercent,
  shortfallAmount,
  totalPaid,
  TRANSACTIONS,
} from "./payments"

function StatCards() {
  const paid = totalPaid(TRANSACTIONS)
  const cards = [
    {
      label: "Total harga paket",
      value: formatMoney(PACKAGE_PRICE),
      caption: `Paket ${PACKAGE_NAME}, ${INSTALLMENT_COUNT} angsuran. Biaya sisi Jerman ${formatMoney(PACKAGE_PRICE_EUR)} ditagih terpisah.`,
    },
    {
      label: "Sudah dibayar",
      value: formatMoney(paid),
      tone: "success",
      caption: `${paidPercent(TRANSACTIONS)}% dari harga paket`,
    },
    {
      label: "Kekurangan",
      value: formatMoney(shortfallAmount(TRANSACTIONS)),
      caption: `Angsuran ke-${nextInstallmentNumber(TRANSACTIONS)} jatuh tempo ${formatDate(nextDueDate(TRANSACTIONS))}`,
      tone: "danger",
    },
    {
      label: "Target per bulan",
      value: formatMoney(monthlyTarget()),
      caption: `Tanggal ${DUE_DAY} tiap bulan`,
    },
  ]

  return (
    <div className="grid-4">
      {cards.map(({ label, value, caption, tone }) => (
        <section key={label} className="card stack stack-sm">
          <span className="label text-muted">{label}</span>
          <span className={`h4 tabular${tone ? ` text-${tone}` : ""}`}>{value}</span>
          <span className="caption text-muted">{caption}</span>
        </section>
      ))}
    </div>
  )
}

export default async function PaymentsPage() {
  await requireSession("student")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Pembayaran"
        subtitle={`Paket ${PACKAGE_NAME} · ${INSTALLMENT_COUNT} angsuran · jatuh tempo tanggal ${DUE_DAY} tiap bulan`}
      />

      <StatCards />

      <PaymentPlanner />

      <PaymentHistory />

      <EuroObligation />
    </div>
  )
}
