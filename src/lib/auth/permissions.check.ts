import assert from "node:assert/strict"

import {
  canEdit,
  canView,
  menuFor,
  PAGES,
  type Permissions,
  type StaffPage,
} from "./permissions.ts"

const labels = (permissions: Permissions) =>
  menuFor(permissions).flatMap((section) => section.items.map((item) => item.label))

const everything: Permissions = Object.fromEntries(PAGES.map((page) => [page.id, "edit"]))
const marketing: Permissions = {
  home: "view",
  students: "view",
  registrations: "edit",
  documents: "view",
  partners: "view",
}

assert.equal(menuFor(everything)[0]?.items[0]?.label, "Dashboard")
assert.equal(
  labels(everything).length,
  (PAGES as readonly StaffPage[]).filter((page) => !page.hidden).length,
)
assert.ok(!labels(everything).includes("Pendaftaran Siswa"))
assert.deepEqual(menuFor({}), [])

assert.deepEqual(
  menuFor(marketing).map((section) => section.group),
  [null, "Kesiswaan", "Pemberkasan & Penempatan"],
)
assert.ok(!labels(marketing).includes("Pengguna & Hak Akses"))

const settings = menuFor(everything).at(-1)
assert.equal(settings?.group, "Pengaturan")
assert.deepEqual(
  settings?.items.map((item) => [item.label, item.href]),
  [
    ["Pengguna & Hak Akses", "/staff/settings/users"],
    ["Master Data", "/staff/settings/master-data"],
    ["Template Cetak", "/staff/settings/print-templates"],
    ["Log Aktivitas", "/staff/settings/activity-log"],
  ],
)

assert.ok(canEdit(marketing, "registrations"))
assert.ok(canView(marketing, "students") && !canEdit(marketing, "students"))
assert.ok(!canView(marketing, "payments"))

console.log("permissions: semua pemeriksaan lolos")
