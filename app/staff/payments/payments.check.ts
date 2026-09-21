import assert from "node:assert/strict"

import { formatMoney } from "../../../src/lib/money.ts"

import {
  inRange,
  isValid,
  PAYMENT_ROWS,
  PAYMENTS,
  pendingQueue,
  receiptKey,
  receiptKind,
  totalValid,
} from "./sample.ts"

assert.equal(PAYMENTS.length, 10)
assert.ok(PAYMENTS.every((row) => (row.lane === "Euro") === (row.amount.currency === "EUR")))
assert.equal(pendingQueue(PAYMENTS).length, 3, "dua tunai Euro, satu Bayar Cash")
assert.ok(
  pendingQueue(PAYMENTS).every((row) => row.method !== "Transfer VA" && row.method !== "QRIS"),
)

const rejected = PAYMENTS.find((row) => row.status === "Ditolak")
assert.ok(rejected && rejected.rejectReason, "penolakan menyimpan alasannya, catatan tidak dihapus")
assert.equal(isValid(rejected), false)

assert.equal(formatMoney(totalValid(PAYMENTS, "IDR")), "Rp 24.999.000")
assert.equal(formatMoney(totalValid(PAYMENTS, "EUR")), "€ 500")

const bayu = PAYMENT_ROWS.find((row) => row.nis === "20250258")
assert.ok(bayu)
assert.equal(bayu.studentName, "Bayu Saputra")
assert.equal(bayu.contractNumber, "213/118-JKT-2025")
assert.equal(receiptKey(bayu), "20250258-2026-09-10-80000", "NIS + tanggal + nominal")
assert.equal(receiptKind(bayu), "Kwitansi")
assert.equal(receiptKind(PAYMENTS[3]!), "Kwitansi Dana Talang")

assert.equal(inRange(bayu, "2026-09-01", "2026-09-30"), true)
assert.equal(inRange(bayu, null, "2026-09-09"), false)

console.log("payments.check.ts - lolos")
