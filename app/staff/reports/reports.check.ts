import assert from "node:assert/strict"

import { add, formatMoney } from "../../../src/lib/money.ts"

import {
  BY_BRANCH,
  BY_PACKAGE,
  BY_PIC,
  collectibility,
  debtRowsAt,
  debtTotal,
  DEFAULT_MONTH,
  endOfMonth,
  monthLabel,
  monthlyRows,
  monthlySummary,
  shiftMonth,
  TOTAL,
  weekOf,
  weeklyRows,
  YEARS,
  yearlySummary,
} from "./sample.ts"

const sumOf = (rows: readonly { paidIdr: { amount: number } }[]) =>
  rows.reduce((sum, row) => sum + row.paidIdr.amount, 0)

assert.equal(sumOf(BY_BRANCH), TOTAL.paidIdr.amount, "total cabang = total keseluruhan")
assert.equal(sumOf(BY_PACKAGE), TOTAL.paidIdr.amount, "total paket = total keseluruhan")
assert.equal(sumOf(BY_PIC), TOTAL.paidIdr.amount, "total PIC = total keseluruhan")
assert.equal(
  BY_BRANCH.reduce((sum, row) => sum + row.students, 0),
  TOTAL.students,
)
assert.equal(formatMoney(TOTAL.paidIdr), "Rp 24.999.000", "sama dengan total berlaku halaman 13")
assert.equal(formatMoney(TOTAL.paidEur), "€ 500")
assert.equal(formatMoney(add(TOTAL.paidIdr, TOTAL.dueIdr)), formatMoney(TOTAL.billedIdr))
assert.ok(collectibility(TOTAL) > 0 && collectibility(TOTAL) < 1)

assert.equal(DEFAULT_MONTH, "2026-09")
assert.equal(monthLabel("2026-09"), "September 2026")
const september = monthlySummary("2026-09")
assert.equal(formatMoney(september.paidIdr), "Rp 18.333.000", "VA + QRIS + dana talang")
assert.equal(september.payersIdr, 3)
assert.equal(formatMoney(september.paidEur), "€ 500")
assert.equal(weekOf("2026-09-01"), 1)
assert.equal(weekOf("2026-09-08"), 2)
assert.equal(weekOf("2026-09-30"), 4)
const weeks = weeklyRows("2026-09")
assert.equal(weeks.length, 4)
assert.equal(
  weeks.reduce((sum, row) => sum + row.totalIdr.amount, 0),
  september.paidIdr.amount,
  "jumlah mingguan = angka ringkas bulan",
)

assert.deepEqual(YEARS, ["2026"])
assert.equal(shiftMonth("2026-01", -1), "2025-12")
assert.equal(shiftMonth("2026-12", 1), "2027-01")
const months = monthlyRows("2026")
assert.equal(months.length, 12)
assert.equal(months[8]?.label, "September")
assert.equal(
  months.reduce((sum, row) => sum + row.totalIdr.amount, 0),
  yearlySummary("2026").paidIdr.amount,
  "jumlah bulanan = angka ringkas tahun",
)
assert.equal(
  formatMoney(yearlySummary("2026").paidIdr),
  "Rp 24.999.000",
  "= total berlaku halaman 13",
)

assert.equal(endOfMonth("2026-02"), "2026-02-28")
assert.equal(endOfMonth("2026-09"), "2026-09-30")
const debtNow = debtRowsAt("2026-09-30")
assert.ok(debtNow.length > 0)
assert.ok(debtNow.every((row) => row.dueIdr.amount > 0 && row.receivable.student.status === "Aktif"))
assert.ok(debtTotal(debtRowsAt("2026-01-31")).amount < debtTotal(debtNow).amount, "piutang menumpuk")
assert.equal(monthlyRows("2026")[11]?.debtIdr, null, "bulan setelah bulan berjalan tanpa piutang")
assert.equal(monthlyRows("2026")[8]?.debtIdr?.amount, debtTotal(debtNow).amount)

console.log("reports.check.ts - lolos")
