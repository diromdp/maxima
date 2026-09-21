import assert from "node:assert/strict"

import { AT_RISK, CLASS_STATS, classStats, risksOf, STUDENTS, teacherStats } from "./sample.ts"

const andi = STUDENTS.find((row) => row.nis === "2026001")
const siti = STUDENTS.find((row) => row.nis === "2026004")
const dewiHamburg = STUDENTS.find((row) => row.nis === "2026033")
assert.ok(andi && siti && dewiHamburg)

assert.deepEqual(risksOf(andi), [], "Andi sehat")
assert.deepEqual(risksOf(siti), [
  "Kehadiran Rendah",
  "Nilai Rendah",
  "Progres Tertinggal",
  "Gagal Evaluasi",
])
assert.equal(
  AT_RISK.some((row) => row.nis === "2026004"),
  false,
  "Siti Cuti tidak tampil",
)
assert.equal(
  AT_RISK.some((row) => row.nis === "2026008"),
  false,
  "Budi Keluar tidak tampil",
)
assert.deepEqual(risksOf(dewiHamburg), ["Kehadiran Rendah", "Nilai Rendah", "Gagal Evaluasi"])

const berlin = CLASS_STATS.find((row) => row.room.id === "berlin")
assert.ok(berlin)
assert.equal(berlin.studentCount, 6, "8 anggota, 1 Cuti, 1 Keluar")
assert.equal(berlin.chapter, 6)
assert.equal(berlin.atRiskCount, 3, "Rina nilai 78, Bayu dan Fajar Kapitel 3 tertinggal")
assert.equal(
  CLASS_STATS.some((row) => row.room.id === "frankfurt"),
  false,
  "Draft tidak dipantau",
)

const mulyadi = teacherStats("Mulyadi, S.Pd")
assert.equal(mulyadi.rooms.length, 2, "Berlin dan Köln")
assert.equal(mulyadi.studentCount, 8)
assert.equal(mulyadi.attendanceFilled, 1)
assert.equal(teacherStats("Andi Wijaya").attendanceFilled, null, "tanpa kelas aktif")
assert.equal(teacherStats("Rina Kumala").scoresFilled, 0.5, "dua dari empat siswa Hamburg bernilai")
assert.equal(classStats(mulyadi.rooms[0]!).room.id, "berlin")

console.log("monitoring.check.ts - lolos")
