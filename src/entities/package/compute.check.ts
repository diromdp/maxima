import assert from "node:assert/strict"

import { monthlyInstallmentOf } from "./compute.ts"

assert.equal(monthlyInstallmentOf(45_000_000, 5_000_000, 12), 3_333_333)
assert.equal(monthlyInstallmentOf(45_000_000, "", 10), 4_500_000)
assert.equal(monthlyInstallmentOf(45_000_000, 5_000_000, ""), "")
assert.equal(monthlyInstallmentOf("", 5_000_000, 12), "")
assert.equal(monthlyInstallmentOf(5_000_000, 5_000_000, 12), "")

console.log("compute.check.ts lolos")
