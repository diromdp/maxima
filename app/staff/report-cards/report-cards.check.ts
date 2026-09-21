import assert from "node:assert/strict"

import {
  attendanceFilled,
  chaptersAboveKkm,
  fileName,
  finalRecommendation,
  formatAttendance,
  isPassing,
  isReady,
  levelsOf,
  QUEUE,
  reportOf,
  scoresFilled,
} from "./sample.ts"

const andi = reportOf("2026001", "A2")
assert.ok(andi)
assert.equal(andi.chapters.length, 12)
assert.equal(andi.chapterAverage?.toFixed(2), "87.83")
assert.equal(andi.exams.length, 5, "A2 tanpa simulasi")
assert.equal(andi.simulations.length, 0)
assert.equal(isPassing(andi), true)
assert.equal(chaptersAboveKkm(andi), 9)
assert.equal(formatAttendance(andi.attendanceRate), "83,33%")
assert.equal(andi.present, 20)
assert.equal(finalRecommendation(andi), "Naik Level A2 ke B1")
assert.equal(fileName(andi), "Juni - 2026 - Raport - Andi Nugroho")
assert.deepEqual(levelsOf("2026001"), ["A2"])
assert.equal(reportOf("2026001", "B1"), null)
assert.equal(reportOf("9999999", "A2"), null)

assert.equal(attendanceFilled("2026001"), 1)
assert.equal(scoresFilled("berlin", "2026001", "A2"), 1)
assert.equal(scoresFilled("berlin", "2026006", "A2") < 1, true, "Fajar tanpa nilai kapitel")

const queueAndi = QUEUE.find((row) => row.nis === "2026001")
const queueRina = QUEUE.find((row) => row.nis === "2026002")
assert.ok(queueAndi && queueRina)
assert.equal(isReady(queueAndi), true)
assert.equal(isReady(queueRina), false, "absensi Rina 20 dari 24")
assert.equal(QUEUE.length, 10)

console.log("report-cards.check.ts - lolos")
