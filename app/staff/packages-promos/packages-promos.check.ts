import assert from "node:assert/strict"

import {
  appliesToLabel,
  formatDiscount,
  formatGate,
  GATE_NAMES,
  GATES_BY_PACKAGE,
  PACKAGE_ROWS,
  PROMOS,
} from "./sample.ts"

assert.equal(PACKAGE_ROWS.length, 6)
assert.ok(Object.values(GATES_BY_PACKAGE).every((gates) => gates.length === GATE_NAMES.length))
assert.ok(
  PACKAGE_ROWS.every((row) => row.id in GATES_BY_PACKAGE),
  "tiap paket punya sembilan gerbang",
)

const ausbildung45 = PACKAGE_ROWS.find((row) => row.id === "ausbildung-45")
const kursus = PACKAGE_ROWS.find((row) => row.id === "kursus-bahasa")
assert.ok(ausbildung45 && kursus)
assert.equal(ausbildung45.monthly?.amount, 3_333_000, "sama dengan target bulanan portal")
assert.equal(ausbildung45.billingDay, 20, "sama dengan DUE_DAY portal")
assert.equal(kursus.monthly, null, "tanpa cicilan bulanan")
assert.equal(kursus.billingDay, null)

assert.equal(formatGate(null), "—")
assert.equal(formatGate(0), "0")
assert.equal(formatGate(7_000_000), "Rp 7.000.000")
assert.equal(GATES_BY_PACKAGE["kursus-bahasa"]![8], null, "Kursus Bahasa tanpa Pengajuan Visa")
assert.equal(GATES_BY_PACKAGE["ika-pasti"]![1], 0, "A2 termasuk paket, langsung terbuka")

assert.equal(formatDiscount({ discountType: "Persentase", value: 10 }), "10%")
assert.equal(formatDiscount({ discountType: "Nominal", value: 1_500_000 }), "Rp 1.500.000")
assert.equal(appliesToLabel(PROMOS[2]!), "Semua Paket")
assert.equal(appliesToLabel(PROMOS[1]!), "Ausbildung 45")
assert.equal(PROMOS[1]!.code, "MAXIMER625", "kode promo yang dikenali formulir pendaftaran")

console.log("packages-promos.check.ts - lolos")
