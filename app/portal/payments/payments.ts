import {
  add,
  eur,
  formatMoney,
  gte,
  idr,
  type Money,
  shortfall,
  subtract,
  sum,
} from "../../../src/lib/money.ts"

export type PaymentMethod = "Payment Gateway" | "Bayar Cash"

export const MIDTRANS_FEE = idr(6_500)

export const gatewayFee = (method: PaymentMethod): Money =>
  method === "Payment Gateway" ? MIDTRANS_FEE : idr(0)

export const totalCharged = (amount: Money, method: PaymentMethod): Money =>
  add(amount, gatewayFee(method))

export type PaymentStatus = "Lunas" | "Menunggu"

export type Transaction = {
  readonly id: string
  readonly date: string
  readonly method: PaymentMethod
  readonly amount: Money
  readonly status: PaymentStatus
}

export const PACKAGE_NAME = "Ausbildung 45"
export const PACKAGE_PRICE = idr(45_000_000)

export const PACKAGE_PRICE_EUR = eur(80_000)

export const PROMO_DISCOUNT = idr(0)

export const INSTALLMENT_COUNT = 12
export const DUE_DAY = 20

export const DP_GATE = idr(5_000_000)

export type Service = {
  readonly name: string
  readonly threshold: Money | null
}

export const SERVICES: readonly Service[] = [
  { name: "Kelas A2", threshold: idr(7_000_000) },
  { name: "Kelas B1", threshold: idr(12_000_000) },
  { name: "Kelas B2", threshold: idr(17_000_000) },
  { name: "Paspor", threshold: idr(22_000_000) },
  { name: "Ujian Bahasa", threshold: idr(26_000_000) },
  { name: "Workshop", threshold: idr(28_000_000) },
  { name: "Pencarian Perusahaan", threshold: idr(34_000_000) },
  { name: "Pengajuan Visa", threshold: idr(40_000_000) },
  { name: "Pemberkasan", threshold: null },
]

const times = (m: Money, n: number): Money =>
  sum(
    Array.from({ length: n }, () => m),
    m.currency,
  )

const floorToThousand = (m: Money): Money => idr(Math.floor(m.amount / 1000) * 1000)

export const priceAfterPromo = (): Money => subtract(PACKAGE_PRICE, PROMO_DISCOUNT)

export const totalPaid = (transactions: readonly Transaction[]): Money =>
  sum(
    transactions.filter((t) => t.status === "Lunas").map((t) => t.amount),
    "IDR",
  )

export const shortfallAmount = (transactions: readonly Transaction[]): Money =>
  shortfall(priceAfterPromo(), totalPaid(transactions))

export const monthlyTarget = (): Money =>
  floorToThousand(idr(subtract(priceAfterPromo(), DP_GATE).amount / INSTALLMENT_COUNT))

export const installmentLabel = (index: number): string =>
  index === 0 ? "DP / Uang Muka" : `Angsuran ke-${index}`

export const nextInstallmentNumber = (transactions: readonly Transaction[]): number =>
  transactions.length

export const paidPercent = (transactions: readonly Transaction[]): number =>
  Math.round((totalPaid(transactions).amount / priceAfterPromo().amount) * 100)

export const pendingTransactions = (transactions: readonly Transaction[]): readonly Transaction[] =>
  transactions.filter((t) => t.status === "Menunggu")

export const nextDueDate = (transactions: readonly Transaction[]): string => {
  const last = transactions[transactions.length - 1]?.date ?? "2026-01-20"
  const [year, month] = last.split("-").map(Number)
  const next = new Date(Date.UTC(year!, month!, DUE_DAY))
  return next.toISOString().slice(0, 10)
}

export const servicesUnlockedCount = (total: Money): number =>
  SERVICES.filter((s) => s.threshold !== null && gte(total, s.threshold)).length

export type Gate = { readonly name: string; readonly threshold: Money }

const GATES: readonly Gate[] = SERVICES.flatMap((s) =>
  s.threshold === null ? [] : [{ name: s.name, threshold: s.threshold }],
)

export const nextGate = (total: Money): Gate | null =>
  GATES.find((g) => !gte(total, g.threshold)) ?? null

export const projectedTotal = (transactions: readonly Transaction[], payment: Money): Money =>
  sum([totalPaid(transactions), payment], "IDR")

export function projectionSentence(transactions: readonly Transaction[], payment: Money): string {
  const after = projectedTotal(transactions, payment)
  const head = `Pembayaran ke-${nextInstallmentNumber(transactions)} membawa total menjadi ${formatMoney(after)}.`
  const gate = nextGate(after)

  if (gate === null) return `${head} Seluruh layanan berambang sudah terbuka.`

  const dibuka = servicesUnlockedCount(after) - servicesUnlockedCount(totalPaid(transactions))

  return dibuka > 0
    ? `${head} Membuka ${dibuka} layanan baru; berikutnya ${gate.name} butuh ${formatMoney(gate.threshold)}.`
    : `${head} Belum cukup untuk ${gate.name} yang butuh ${formatMoney(gate.threshold)}.`
}

export type OutlookRow = {
  readonly label: string
  readonly unlocked: number
}

export function unlockOutlook(transactions: readonly Transaction[]): readonly OutlookRow[] {
  const now = totalPaid(transactions)
  const next = nextInstallmentNumber(transactions)
  const monthly = monthlyTarget()

  return [
    { label: "Sekarang terbuka", unlocked: servicesUnlockedCount(now) },
    ...[0, 1].map((step) => ({
      label: `Setelah angsuran ke-${next + step}`,
      unlocked: servicesUnlockedCount(sum([now, times(monthly, step + 1)], "IDR")),
    })),
  ]
}

export const TRANSACTIONS: readonly Transaction[] = [
  {
    id: "trx-1",
    date: "2026-02-20",
    method: "Bayar Cash",
    amount: idr(5_000_000),
    status: "Lunas",
  },
  {
    id: "trx-2",
    date: "2026-03-20",
    method: "Payment Gateway",
    amount: idr(3_333_000),
    status: "Lunas",
  },
  {
    id: "trx-3",
    date: "2026-04-20",
    method: "Payment Gateway",
    amount: idr(3_333_000),
    status: "Lunas",
  },
  {
    id: "trx-4",
    date: "2026-05-20",
    method: "Payment Gateway",
    amount: idr(3_333_000),
    status: "Lunas",
  },
  {
    id: "trx-5",
    date: "2026-06-20",
    method: "Payment Gateway",
    amount: idr(3_333_000),
    status: "Lunas",
  },
  {
    id: "trx-6",
    date: "2026-07-20",
    method: "Payment Gateway",
    amount: idr(10_168_000),
    status: "Lunas",
  },
  {
    id: "trx-7",
    date: "2026-08-20",
    method: "Bayar Cash",
    amount: idr(3_333_000),
    status: "Menunggu",
  },
]

export type EuroStatus = "Disahkan" | "Menunggu pengesahan"

export type EuroPayment = {
  readonly id: string
  readonly date: string
  readonly amount: Money
  readonly branch: string
  readonly recordedBy: string
  readonly status: EuroStatus
  readonly ratifiedBy?: string
}

export const EURO_PAYMENTS: readonly EuroPayment[] = [
  {
    id: "eur-1",
    date: "2026-05-12",
    amount: eur(50_000),
    branch: "Bandung",
    recordedBy: "Staf Finance Sinta",
    status: "Disahkan",
    ratifiedBy: "Manajer Finance Dwi",
  },
  {
    id: "eur-2",
    date: "2026-08-14",
    amount: eur(10_000),
    branch: "Bandung",
    recordedBy: "Staf Finance Sinta",
    status: "Menunggu pengesahan",
  },
]

export const ratifiedEuro = (payments: readonly EuroPayment[]): Money =>
  sum(
    payments.filter((p) => p.status === "Disahkan").map((p) => p.amount),
    "EUR",
  )

export const pendingEuro = (payments: readonly EuroPayment[]): Money =>
  sum(
    payments.filter((p) => p.status === "Menunggu pengesahan").map((p) => p.amount),
    "EUR",
  )

export const shortfallEuro = (payments: readonly EuroPayment[]): Money =>
  shortfall(PACKAGE_PRICE_EUR, ratifiedEuro(payments))
