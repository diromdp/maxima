import assert from "node:assert/strict"

import {
  CONSULTANTS,
  consultantTotals,
  LEAD_SOURCES,
  leadShare,
  ratio,
  totalLeadStudents,
} from "./sample.ts"

const totals = consultantTotals(CONSULTANTS)
assert.deepEqual(totals, {
  handled: 470,
  signed: 436,
  downPayment: 403,
  active: 369,
  leftOrOnLeave: 12,
})

assert.equal(ratio(totals.signed, totals.handled), 93)
assert.equal(ratio(0, 0), 0, "pembagi nol tidak boleh NaN")

assert.equal(totalLeadStudents(LEAD_SOURCES), 471)

const share = leadShare(LEAD_SOURCES)
assert.equal(share[0]!.name, "Media Sosial", "terbesar di atas")
assert.equal(share[0]!.percent, 45)
assert.equal(share.at(-1)!.name, "Lainnya")
assert.equal(share.at(-1)!.percent, 3)

console.log("marketing.check.ts lolos")
