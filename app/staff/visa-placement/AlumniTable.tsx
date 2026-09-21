"use client"

import { Cancel01Icon, Search01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import Link from "next/link"
import { useState } from "react"

import {
  ALUMNI,
  ALUMNI_STATUS_BADGE,
  ALUMNI_STATUSES,
  alumnusStatus,
  BRANCHES,
  CHECKLIST_SHORT,
  DEPARTURE_CHECKLIST,
  PROGRAMS,
  VISA_STATUS_BADGE,
  visaStatus,
} from "./sample"

export function AlumniTable() {
  const [query, setQuery] = useState("")
  const [branch, setBranch] = useState<string | null>(null)
  const [program, setProgram] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const rows = ALUMNI.filter(
    (alumnus) =>
      (!branch || alumnus.branch === branch) &&
      (!program || alumnus.program === program) &&
      (!status || alumnusStatus(alumnus) === status) &&
      (query === "" ||
        `${alumnus.name} ${alumnus.nis} ${alumnus.contractNumber}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  )

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <TextInput
          aria-label="Cari alumni"
          placeholder="Cari nama, NIS, atau No Kontrak"
          size="sm"
          w={280}
          leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
        <div className="row row-wrap" style={{ gap: 8 }}>
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
          <Select
            aria-label="Saring status"
            placeholder="Status: Semua"
            size="sm"
            w={170}
            data={[...ALUMNI_STATUSES]}
            value={status}
            onChange={setStatus}
            clearable
          />
        </div>
      </div>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th colSpan={7} className="text-muted" style={{ fontWeight: 600 }}>
                Identitas dan penempatan
              </th>
              <th
                colSpan={DEPARTURE_CHECKLIST.length}
                className="text-muted"
                style={{ fontWeight: 600 }}
              >
                Checklist keberangkatan (diisi siswa)
              </th>
            </tr>
            <tr>
              <th>Visa</th>
              <th>Nama Siswa</th>
              <th>NIS / No Kontrak</th>
              <th>Status</th>
              <th>Perusahaan</th>
              <th>Kota</th>
              <th>Jurusan</th>
              {DEPARTURE_CHECKLIST.map((item) => (
                <th key={item} title={item} style={{ textAlign: "center", fontSize: 11 }}>
                  {CHECKLIST_SHORT[item]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7 + DEPARTURE_CHECKLIST.length} className="text-muted">
                  Tidak ada alumni yang cocok dengan saringan.
                </td>
              </tr>
            )}
            {rows.map((alumnus) => {
              const currentStatus = alumnusStatus(alumnus)
              const currentVisa = visaStatus(alumnus.visa)
              return (
                <tr key={alumnus.nis}>
                  <td>
                    <span className={`badge whitespace-nowrap ${VISA_STATUS_BADGE[currentVisa]}`}>
                      {currentVisa}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/staff/visa-placement/${alumnus.nis}`}
                      className="stack"
                      style={{
                        gap: 0,
                        alignItems: "flex-start",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <span className="link" style={{ fontSize: 14 }}>
                        {alumnus.name}
                      </span>
                      <span className="caption text-muted">
                        {alumnus.salutation} · {alumnus.program} {alumnus.intakeYear} ·{" "}
                        {alumnus.branch}
                      </span>
                    </Link>
                  </td>
                  <td>
                    <span className="stack tabular" style={{ gap: 0 }}>
                      <span>{alumnus.nis}</span>
                      <span className="caption text-muted">{alumnus.contractNumber}</span>
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge whitespace-nowrap ${ALUMNI_STATUS_BADGE[currentStatus]}`}
                    >
                      {currentStatus}
                    </span>
                  </td>
                  <td>{alumnus.placement.company}</td>
                  <td>{alumnus.placement.cityState.split(",")[0]}</td>
                  <td>{alumnus.field}</td>
                  {DEPARTURE_CHECKLIST.map((item) => {
                    const isChecked = alumnus.checklist.includes(item)
                    return (
                      <td key={item} style={{ textAlign: "center", padding: "10px 6px" }}>
                        <span
                          className={isChecked ? "text-success" : "text-faint"}
                          role="img"
                          aria-label={`${item}: ${isChecked ? "sudah" : "belum"}`}
                        >
                          <HugeiconsIcon
                            icon={isChecked ? Tick02Icon : Cancel01Icon}
                            size={14}
                            strokeWidth={2}
                          />
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <span className="caption text-muted">
        Menampilkan {rows.length} dari {ALUMNI.length} alumni. Gulir ke kanan untuk seluruh butir
        checklist. Klik nama untuk membuka detail.
      </span>
    </section>
  )
}
