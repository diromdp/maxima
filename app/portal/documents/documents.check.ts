import assert from "node:assert/strict"

import { canUpload, progress, summarize, DOCUMENT_GROUPS, isLocked } from "./documents.ts"

const findGroup = (id: string) => DOCUMENT_GROUPS.find((r) => r.id === id)!

assert.deepEqual(progress(findGroup("pribadi")), { done: 6, total: 6 })
assert.deepEqual(progress(findGroup("bewerbung")), { done: 1, total: 4 })
assert.deepEqual(progress(findGroup("hasil-layanan")), { done: 1, total: 5 })

assert.equal(isLocked(findGroup("dari-betrieb"), false), true)
assert.equal(isLocked(findGroup("dari-betrieb"), true), false)
assert.equal(
  isLocked(findGroup("pribadi"), false),
  false,
  "hanya Dari Betrieb yang bergantung Vertrag",
)

const serviceGroup = findGroup("hasil-layanan")
for (const b of serviceGroup.files) {
  assert.equal(canUpload(serviceGroup, b, true), false, `${b.name} tidak boleh punya tombol unggah`)
}

const betrieb = findGroup("dari-betrieb")
assert.equal(canUpload(betrieb, betrieb.files[0]!, false), false)
assert.equal(canUpload(betrieb, betrieb.files[0]!, true), true)

assert.equal(summarize(findGroup("pribadi"), false).tone, "beres")
assert.equal(summarize(findGroup("hasil-layanan"), false).tone, "berjalan")
assert.equal(summarize(findGroup("hasil-layanan"), false).caption, "4 berkas masih diproses Maxima")
assert.equal(summarize(findGroup("bewerbung"), false).tone, "tindakan")
assert.equal(summarize(findGroup("bewerbung"), false).caption, "1 berkas perlu Anda unggah")
assert.equal(summarize(betrieb, false).tone, "terkunci")
assert.equal(summarize(betrieb, true).tone, "tindakan")

console.log("documents.check.ts lolos")
