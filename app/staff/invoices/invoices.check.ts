import assert from "node:assert/strict"

import { formatMoney } from "../../../src/lib/money.ts"

import {
  averageDaysLate,
  billingDates,
  daysBetween,
  DUE_ROWS,
  nextBillingDate,
  overdueCount,
  overdueTotal,
  RECEIVABLES,
  receivableByNis,
  targetAfter,
} from "./sample.ts"

assert.equal(RECEIVABLES.length, 9, "tiap siswa punya paket yang dikenal")

const andi = receivableByNis("20250233")
assert.ok(andi)
assert.equal(formatMoney(andi.priceIdr), "Rp 45.000.000")
assert.equal(formatMoney(andi.paidIdr), "Rp 6.666.000", "dua Transfer VA otomatis")
assert.equal(formatMoney(andi.dueIdr), "Rp 38.334.000")
assert.equal(formatMoney(andi.paidEur), "€ 0", "€ 100 masih menunggu pengesahan")
assert.equal(andi.dueEur && formatMoney(andi.dueEur), "€ 800")
assert.equal(andi.transactionCount, 2)
assert.equal(andi.lastPaid, "2026-09-12")

assert.deepEqual(billingDates("2026-01-15", 20, "2026-04-01"), [
  "2026-01-20",
  "2026-02-20",
  "2026-03-20",
])
assert.deepEqual(billingDates("2026-01-25", 20, "2026-03-01"), ["2026-02-20"])
assert.equal(nextBillingDate(20, "2026-09-20"), "2026-10-20")
assert.equal(nextBillingDate(20, "2026-09-15"), "2026-09-20")
assert.equal(daysBetween("2026-09-01", "2026-09-20"), 19)
assert.equal(formatMoney(targetAfter(andi.pkg, 2)), "Rp 11.666.000", "DP + 2 angsuran")
assert.equal(formatMoney(targetAfter(andi.pkg, 99)), "Rp 45.000.000", "tidak melebihi harga")

const andiDue = DUE_ROWS.find((row) => row.student.nis === "20250233")
assert.ok(andiDue)
assert.equal(andiDue.status, "TERLAMBAT")
assert.equal(andiDue.dueDate, "2026-09-20")
assert.equal(andiDue.daysLate, 0)
assert.equal(
  DUE_ROWS.some((row) => row.student.status === "Cuti"),
  false,
  "Cuti tidak ditagih",
)
assert.equal(
  DUE_ROWS.some((row) => row.student.nis === "20240172"),
  false,
  "Alumni tidak ditagih",
)

assert.equal(overdueCount(DUE_ROWS), DUE_ROWS.filter((row) => row.status === "TERLAMBAT").length)
assert.ok(overdueTotal(DUE_ROWS).amount > 0)
assert.ok(averageDaysLate(DUE_ROWS) >= 0)

console.log("invoices.check.ts - lolos")
