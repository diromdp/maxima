"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import Link from "next/link"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { DASH } from "@/src/lib/format"

import {
  BOARD,
  type BoardStudent,
  BRANCHES,
  PACKAGE_NAMES,
  SERVICE_COLUMNS,
  SERVICE_STATES,
  STATE_BADGE,
  STATE_HINT,
} from "./sample"

export function ServiceBoard() {
  const [branch, setBranch] = useState<string | null>(null)
  const [packageName, setPackageName] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const students = BOARD.filter(
    (student) =>
      (!branch || student.branch === branch) &&
      (!packageName || student.packageName === packageName) &&
      (query === "" ||
        `${student.name} ${student.nis}`.toLowerCase().includes(query.toLowerCase())),
  )

  const columns: readonly DataColumn<BoardStudent>[] = [
    {
      key: "name",
      header: "Nama Siswa",
      sort: (student) => student.name,
      cell: (student) => (
        <Link
          href={`/staff/services/${student.nis}`}
          className="stack"
          style={{ gap: 0, alignItems: "flex-start", textDecoration: "none", color: "inherit" }}
        >
          <span className="link" style={{ fontSize: 14 }}>
            {student.name}
          </span>
          <span className="caption text-muted">
            {student.packageName} · {student.branch}
          </span>
        </Link>
      ),
    },
    ...SERVICE_COLUMNS.map(({ id, label }): DataColumn<BoardStudent> => ({
      key: id,
      header: label,
      cell: (student) => {
        const state = student.cells[id]
        if (state === null) {
          return (
            <span
              className="text-muted"
              role="img"
              aria-label={`Tidak termasuk paket ${student.packageName}`}
            >
              {DASH}
            </span>
          )
        }
        return (
          <span className={`badge whitespace-nowrap px-1.5 text-[11px] ${STATE_BADGE[state]}`}>
            {state}
          </span>
        )
      },
    })),
  ]

  return (
    <div className="stack stack-lg">
      <section className="card stack">
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
              aria-label="Saring cabang"
              placeholder="Cabang: Semua"
              size="sm"
              w={180}
              data={[...BRANCHES]}
              value={branch}
              onChange={setBranch}
              clearable
            />
            <Select
              aria-label="Saring paket"
              placeholder="Paket: Semua"
              size="sm"
              w={200}
              data={[...PACKAGE_NAMES]}
              value={packageName}
              onChange={setPackageName}
              clearable
            />
          </div>
        </div>
      </section>

      <section className="card stack">
        <div className="row row-between row-wrap" style={{ gap: 12 }}>
          <div className="row row-wrap" style={{ gap: 12 }}>
            <span className="label text-muted">Legenda status gerbang</span>
            {SERVICE_STATES.map((state) => (
              <span key={state} className="row" style={{ gap: 6 }}>
                <span className={`badge ${STATE_BADGE[state]}`}>{state}</span>
                <span className="caption text-muted">{STATE_HINT[state]}</span>
              </span>
            ))}
          </div>
          <span className="caption text-muted wrap">
            Klik nama siswa untuk membuka detail layanannya. Layanan di luar paket ditulis tanda
            hubung.
          </span>
        </div>

        <DataTable
          rows={students}
          rowKey={(student) => student.nis}
          columns={columns}
          defaultSort={{ key: "name", dir: "asc" }}
          emptyText="Tidak ada siswa yang cocok dengan saringan."
        />
      </section>
    </div>
  )
}
