import assert from "node:assert/strict"

import { canEdit, canView, menuFor, PAGES, ROLE_ACCESS, type StaffPage } from "./permissions.ts"

const flat = (role: string) => menuFor(role).flatMap((s) => s.items.map((i) => i.label))

for (const role of Object.keys(ROLE_ACCESS)) {
  assert.ok(canView(role, "home"), `${role} tidak melihat Dashboard`)
  assert.equal(
    menuFor(role)[0]?.items[0]?.label,
    "Dashboard",
    `Dashboard bukan butir pertama ${role}`,
  )
}

assert.equal(
  flat("Admission").length,
  (PAGES as readonly StaffPage[]).filter((p) => !p.hidden).length,
)
assert.ok(!flat("Admission").includes("Pendaftaran Siswa"))
assert.ok(canEdit("Admission", "registrations"))
assert.deepEqual(menuFor("Peran Karangan"), [])

const marketing = menuFor("Marketing")
assert.ok(!flat("Marketing").includes("Pengguna & Hak Akses"))
assert.ok(!marketing.some((s) => s.group === "Akademik"))
assert.deepEqual(
  marketing.map((s) => s.group),
  // Siswa sendirian di Kesiswaan (Pendaftaran disembunyikan) - kelompok satu butir tanpa judul.
  [null, null, "Pemberkasan & Penempatan"],
)

const pengaturan = menuFor("Admission").at(-1)!
assert.equal(pengaturan.group, "Pengaturan")
assert.deepEqual(
  pengaturan.items.map((i) => [i.label, i.href]),
  [
    ["Pengguna & Hak Akses", "/staff/settings/users"],
    ["Master Data", "/staff/settings/master-data"],
    ["Template Cetak", "/staff/settings/print-templates"],
    ["Log Aktivitas", "/staff/settings/activity-log"],
  ],
)
assert.ok(!flat("Staf Finance").includes("Master Data"))

assert.ok(canEdit("Pengajar", "assessments"))
assert.ok(canView("Pengajar", "students") && !canEdit("Pengajar", "students"))

console.log("permissions: semua pemeriksaan lolos")
