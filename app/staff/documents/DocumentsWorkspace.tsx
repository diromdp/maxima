"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import { useState } from "react"

import { BRANCHES, PROGRAMS, STUDENTS, waitingCount } from "./sample"
import { StudentIndex } from "./StudentIndex"

const WAITING_FILTER = ["Ada yang menunggu", "Tidak ada yang menunggu"] as const

export function DocumentsWorkspace() {
  const [branch, setBranch] = useState<string | null>(null)
  const [program, setProgram] = useState<string | null>(null)
  const [waiting, setWaiting] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const students = STUDENTS.filter(
    (student) =>
      (!branch || student.branch === branch) &&
      (!program || student.program === program) &&
      (!waiting ||
        (waiting === WAITING_FILTER[0]
          ? waitingCount(student) > 0
          : waitingCount(student) === 0)) &&
      (query === "" ||
        `${student.name} ${student.nis}`.toLowerCase().includes(query.toLowerCase())),
  )
  const totalWaiting = students.reduce((count, student) => count + waitingCount(student), 0)
  const studentsWaiting = students.filter((student) => waitingCount(student) > 0).length

  return (
    <div className="stack stack-lg">
      <section className="card">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <TextInput
            aria-label="Cari siswa"
            placeholder="Cari nama atau NIS"
            size="sm"
            w={260}
            leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <div className="row row-wrap" style={{ gap: 8 }}>
            <Select
              aria-label="Saring verifikasi"
              placeholder="Verifikasi: Semua"
              size="sm"
              w={210}
              data={[...WAITING_FILTER]}
              value={waiting}
              onChange={setWaiting}
              clearable
            />
            <Select
              aria-label="Saring cabang"
              placeholder="Cabang: Semua"
              size="sm"
              w={160}
              data={[...BRANCHES]}
              value={branch}
              onChange={setBranch}
              clearable
            />
            <Select
              aria-label="Saring program"
              placeholder="Program: Semua"
              size="sm"
              w={170}
              data={[...PROGRAMS]}
              value={program}
              onChange={setProgram}
              clearable
            />
          </div>
        </div>
      </section>

      <section className="card stack">
        <div className="row row-between row-wrap">
          <div className="stack" style={{ gap: 2 }}>
            <h2 className="h5">Kelengkapan Berkas per Siswa</h2>
            <span className="caption text-muted">
              Satu baris satu siswa, empat rumpun. Tombol Verifikasi membuka berkas yang menunggu di
              halaman siswa itu.
            </span>
          </div>
          <span className={`badge tabular ${totalWaiting > 0 ? "badge-berjalan" : "badge-beres"}`}>
            {totalWaiting > 0
              ? `${totalWaiting} berkas menunggu di ${studentsWaiting} siswa`
              : "Tidak ada yang menunggu"}
          </span>
        </div>
        <StudentIndex students={students} />
      </section>
    </div>
  )
}
