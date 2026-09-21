import assert from "node:assert/strict"

import { formatMoney, idr, sum } from "../../../src/lib/money.ts"

import {
  EURO_PAYMENTS,
  gatewayFee,
  installmentLabel,
  monthlyTarget,
  nextGate,
  nextDueDate,
  nextInstallmentNumber,
  paidPercent,
  pendingTransactions,
  PACKAGE_PRICE,
  PACKAGE_PRICE_EUR,
  pendingEuro,
  ratifiedEuro,
  shortfallEuro,
  projectedTotal,
  projectionSentence,
  servicesUnlockedCount,
  shortfallAmount,
  TRANSACTIONS,
  totalCharged,
  totalPaid,
  unlockOutlook,
} from "./payments.ts"

assert.equal(formatMoney(gatewayFee("Payment Gateway")), "Rp 6.500")
assert.equal(formatMoney(gatewayFee("Bayar Cash")), "Rp 0")
assert.equal(formatMoney(totalCharged(monthlyTarget(), "Payment Gateway")), "Rp 3.339.500")
assert.equal(formatMoney(totalCharged(monthlyTarget(), "Bayar Cash")), "Rp 3.333.000")

assert.equal(formatMoney(PACKAGE_PRICE), "Rp 45.000.000")
assert.equal(formatMoney(totalPaid(TRANSACTIONS)), "Rp 28.500.000")
assert.equal(formatMoney(shortfallAmount(TRANSACTIONS)), "Rp 16.500.000")
assert.equal(formatMoney(monthlyTarget()), "Rp 3.333.000")

assert.equal(TRANSACTIONS.filter((t) => t.status === "Menunggu").length, 1)
assert.equal(TRANSACTIONS.length, 7, "lampiran menyebut 7 transaksi")

assert.equal(installmentLabel(0), "DP / Uang Muka")
assert.equal(installmentLabel(1), "Angsuran ke-1")
assert.equal(installmentLabel(6), "Angsuran ke-6")
assert.equal(nextInstallmentNumber(TRANSACTIONS), 7)
assert.equal(installmentLabel(TRANSACTIONS.length), "Angsuran ke-7")
assert.ok(TRANSACTIONS.every((t) => !("installmentNumber" in t) && !("nomorAngsuran" in t)))
assert.notEqual(TRANSACTIONS[5].amount.amount, monthlyTarget().amount)
assert.equal(installmentLabel(5), "Angsuran ke-5")

assert.equal(servicesUnlockedCount(totalPaid(TRANSACTIONS)), 6, "6 dari 9 sekarang")

const setelahKe7 = projectedTotal(TRANSACTIONS, monthlyTarget())
assert.equal(formatMoney(setelahKe7), "Rp 31.833.000")
assert.equal(servicesUnlockedCount(setelahKe7), 6)
assert.equal(nextGate(setelahKe7)?.name, "Pencarian Perusahaan")
assert.equal(
  projectionSentence(TRANSACTIONS, monthlyTarget()),
  "Pembayaran ke-7 membawa total menjadi Rp 31.833.000. Belum cukup untuk Pencarian Perusahaan yang butuh Rp 34.000.000.",
)

const setelahLunas = projectedTotal(TRANSACTIONS, shortfallAmount(TRANSACTIONS))
assert.equal(formatMoney(setelahLunas), "Rp 45.000.000")
assert.equal(servicesUnlockedCount(setelahLunas), 8, "Pemberkasan tidak digerakkan uang")
assert.equal(nextGate(setelahLunas), null)
assert.match(projectionSentence(TRANSACTIONS, shortfallAmount(TRANSACTIONS)), /Seluruh layanan/)

assert.match(projectionSentence(TRANSACTIONS, idr(6_000_000)), /Membuka 1 layanan baru/)

assert.deepEqual(unlockOutlook(TRANSACTIONS), [
  { label: "Sekarang terbuka", unlocked: 6 },
  { label: "Setelah angsuran ke-7", unlocked: 6 },
  { label: "Setelah angsuran ke-8", unlocked: 7 },
])

console.log("payments.check.ts — lolos")

assert.equal(nextDueDate(TRANSACTIONS), "2026-09-20")
assert.equal(paidPercent(TRANSACTIONS), 63)
assert.equal(pendingTransactions(TRANSACTIONS).length, 1)

assert.equal(formatMoney(PACKAGE_PRICE_EUR), "€ 800")
assert.equal(formatMoney(ratifiedEuro(EURO_PAYMENTS)), "€ 500")
assert.equal(formatMoney(pendingEuro(EURO_PAYMENTS)), "€ 100")
assert.equal(
  formatMoney(shortfallEuro(EURO_PAYMENTS)),
  "€ 300",
  "yang menunggu pengesahan belum mengurangi sisa",
)
assert.throws(
  () => sum([totalPaid(TRANSACTIONS), PACKAGE_PRICE_EUR], "IDR"),
  "Rupiah dan Euro tidak pernah dijumlahkan",
)
