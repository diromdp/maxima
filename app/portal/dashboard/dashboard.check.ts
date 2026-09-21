import assert from "node:assert/strict"

import { formatMoney } from "../../../src/lib/money.ts"
import { DOCUMENT_GROUPS } from "../documents/documents.ts"
import { SERVICES, totalPaid, TRANSACTIONS } from "../payments/payments.ts"
import {
  ATTENDANCE,
  CHAPTERS_PER_LEVEL,
  deriveAttendance,
  deriveCurrentLevel,
  deriveCurrentStep,
  deriveDocuments,
  deriveHistory,
  deriveIdentity,
  deriveLevelLabel,
  deriveNextService,
  deriveServices,
  deriveServiceSummary,
  LEVELS,
  STUDENT,
  type Student,
} from "./dashboard.ts"

const plainDate = (iso: string) => iso

const current = deriveCurrentLevel(LEVELS)!
assert.equal(current.level, "A2")
assert.equal(`bab ${current.chapter} dari ${CHAPTERS_PER_LEVEL}`, "bab 7 dari 12")

assert.equal(Math.round(deriveAttendance(ATTENDANCE) * 100), 91)
assert.equal(deriveAttendance({ present: 0, expected: 0 }), 0, "kelas kosong tidak boleh NaN")

const services = deriveServices(SERVICES, totalPaid(TRANSACTIONS), false)
assert.equal(services.length, 9)
assert.deepEqual(deriveServiceSummary(services), { unlocked: 6, total: 9, pending: 2 })

const shortageOf = (name: string) => formatMoney(services.find((s) => s.name === name)!.remaining!)
assert.equal(shortageOf("Pencarian Perusahaan"), "Rp 5.500.000")
assert.equal(shortageOf("Pengajuan Visa"), "Rp 11.500.000")
assert.equal(shortageOf("Paspor"), "Rp 0", "yang sudah terbuka tidak pernah punya kekurangan")
assert.equal(services.at(-1)!.remaining, null, "Pemberkasan tidak punya gerbang uang")
assert.equal(deriveServices(SERVICES, totalPaid(TRANSACTIONS), true).at(-1)!.unlocked, true)

assert.equal(deriveNextService(services)!.name, "Pencarian Perusahaan")

const history = deriveHistory(TRANSACTIONS, 4)
assert.equal(history.length, 4)
assert.equal(history[0]!.description, "Angsuran ke-6", "terbaru di atas")
assert.equal(history[0]!.status, "Menunggu", "sama dengan halaman Pembayaran")
assert.equal(deriveHistory(TRANSACTIONS).at(-1)!.description, "DP / Uang Muka")

assert.equal(deriveLevelLabel(LEVELS[0]!), "Lulus · nilai 82")
assert.equal(deriveLevelLabel(LEVELS[1]!), "Berjalan · bab 7")
assert.equal(deriveLevelLabel(LEVELS[2]!), "Belum mulai")

assert.deepEqual(
  deriveDocuments(DOCUMENT_GROUPS, false).map((d) => [d.name, d.description, d.tone]),
  [
    ["Pribadi", "6 dari 6", "beres"],
    ["Hasil Layanan", "1 dari 5", "berjalan"],
    ["Bewerbung", "1 dari 4", "tindakan"],
    ["Dari Betrieb", "belum dibuka", "terkunci"],
  ],
)

assert.equal(
  deriveIdentity(STUDENT),
  "NIS 20250233 · Ausbildung 45 · Cabang Bandung · PIC Ratna Sari",
)
assert.equal(
  deriveIdentity({ ...STUDENT, branch: null, pic: null }),
  "NIS 20250233 · Ausbildung 45",
)

const active = deriveCurrentStep(STUDENT, TRANSACTIONS, SERVICES, plainDate)
assert.equal(active.tone, "tindakan")
assert.equal(active.title, "Bayar angsuran ke-7 sebelum 2026-09-20")
assert.equal(
  active.detail,
  "Setelah pembayaran masuk, layanan Pencarian Perusahaan terbuka otomatis.",
)
assert.equal(active.action?.href, "/portal/payments")

const onLeave: Student = {
  ...STUDENT,
  status: "leave",
  leave: { until: "2026-12-01", returnDate: "2026-12-02" },
}
assert.equal(deriveCurrentStep(onLeave, TRANSACTIONS, SERVICES, plainDate).tone, "berjalan")

const alumni: Student = {
  ...STUDENT,
  status: "alumni",
  placement: { company: "Klinikum Nord", school: "Berufsschule Hamburg", city: "Hamburg" },
}
assert.equal(deriveCurrentStep(alumni, TRANSACTIONS, SERVICES, plainDate).tone, "beres")

console.log("dashboard.check.ts lolos")
