import assert from "node:assert/strict"

import { dapatDiubah, deriveStatus, SERTIFIKAT, segeraKedaluwarsa } from "./certificates.ts"

const cari = (id: string) => SERTIFIKAT.find((s) => s.id === id)!
const HARI_INI = new Date("2026-09-18")

assert.equal(deriveStatus(cari("goethe-b2"), HARI_INI), "Terverifikasi")
assert.equal(
  deriveStatus(cari("goethe-a1"), HARI_INI),
  "Expired",
  "tanggal lewat menang atas verifikasi",
)
assert.equal(deriveStatus(cari("osd-a2"), HARI_INI), "Expired")

assert.equal(dapatDiubah(cari("goethe-b2"), HARI_INI), false, "terverifikasi terkunci")
assert.equal(dapatDiubah(cari("osd-a2"), HARI_INI), false, "kedaluwarsa terkunci")

const campuran = {
  ...cari("goethe-b2"),
  modul: {
    ...cari("goethe-b2").modul,
    sprechen: { nilai: 80, expired: "2026-01-31" },
  },
}
assert.equal(deriveStatus(campuran, HARI_INI), "Expired")

assert.equal(segeraKedaluwarsa(cari("goethe-a1"), HARI_INI), false)
assert.equal(
  segeraKedaluwarsa(
    { ...campuran, modul: { ...campuran.modul, sprechen: { nilai: 80, expired: "2026-11-01" } } },
    HARI_INI,
  ),
  true,
)

console.log("certificates.check.ts — lolos")
