"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import Link from "next/link"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"

import { type Registration, REGISTRATION_COLUMNS, registrationOf } from "./registration"
import {
  completenessLabel,
  type FilterKey,
  filterOptions,
  FILTERS,
  STATUS_BADGE,
  type Student,
  STUDENTS,
} from "./sample"

type Filters = Readonly<Partial<Record<FilterKey, string>>>

type Row = Student & { readonly reg: Registration }

const matchesQuery = (s: Student, query: string) =>
  query === "" ||
  `${s.name} ${s.nis} ${s.contractNumber}`.toLowerCase().includes(query.toLowerCase())

const matchesFilters = (s: Student, filters: Filters) =>
  FILTERS.every(({ key }) => !filters[key] || s[key] === filters[key])

export function StudentsTable() {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<Filters>({})

  const rows: readonly Row[] = STUDENTS.map((s, i) => ({ ...s, reg: registrationOf(s, i) })).filter(
    (s) => matchesQuery(s, query) && matchesFilters(s, filters),
  )
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  // Kolom mengikuti urutan formulir /register; NIS dan Nama di depan supaya baris
  // tetap terbaca saat menggulir mendatar, keadaan sistem (status, level,
  // kelengkapan) di ujung.
  const columns: readonly DataColumn<Row>[] = [
    {
      key: "nis",
      header: "NIS",
      sort: (s) => s.nis,
      cell: (s) => <span className="tabular">{s.nis}</span>,
    },
    {
      key: "name",
      header: "Nama Lengkap",
      sort: (s) => s.name,
      cell: (s) => (
        <Link
          href={`/staff/students/${s.nis}`}
          className="text-ink no-underline hover:underline"
          style={{ fontWeight: 600, whiteSpace: "nowrap" }}
        >
          {s.name}
        </Link>
      ),
    },
    {
      key: "contract",
      header: "No Kontrak",
      sort: (s) => s.contractNumber,
      cell: (s) => <span className="tabular">{s.contractNumber}</span>,
    },
    ...REGISTRATION_COLUMNS.map(({ key, header }): DataColumn<Row> => ({
      key,
      header,
      sort: (s) => s.reg[key],
      cell: (s) =>
        key === "signatureFile" ? (
          <a className="link" href={`/files/${s.reg[key]}`} target="_blank" rel="noopener">
            {s.reg[key]}
          </a>
        ) : (
          <span style={{ whiteSpace: "nowrap" }}>{s.reg[key]}</span>
        ),
    })),
    {
      key: "status",
      header: "Status",
      sort: (s) => s.status,
      cell: (s) => <span className={`badge ${STATUS_BADGE[s.status]}`}>{s.status}</span>,
    },
    {
      key: "level",
      header: "Level",
      sort: (s) => s.level,
      cell: (s) => <span className="badge">{s.level}</span>,
    },
    {
      key: "completeness",
      header: "Kelengkapan",
      sort: (s) => s.missingFields,
      cell: (s) => (
        <span className={`badge ${s.missingFields === 0 ? "badge-beres" : "badge-tindakan"}`}>
          {completenessLabel(s)}
        </span>
      ),
    },
  ]

  return (
    <section className="card stack">
      <div className="row row-wrap" style={{ gap: 8 }}>
        <TextInput
          aria-label="Cari siswa"
          placeholder="Cari nama, NIS, No Kontrak"
          size="sm"
          leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          style={{ flex: "1 1 240px", maxWidth: 320 }}
        />
        {FILTERS.map(({ key, label }) => (
          <Select
            key={key}
            aria-label={`Saring ${label}`}
            placeholder={label}
            size="sm"
            w={label.length * 8 + 60}
            comboboxProps={{ width: 220, position: "bottom-start" }}
            data={[...filterOptions(key)]}
            value={filters[key] ?? null}
            onChange={(value) =>
              setFilters((current) => ({ ...current, [key]: value ?? undefined }))
            }
            clearable
          />
        ))}
        <div className="row" style={{ gap: 8, marginInlineStart: "auto" }}>
          <span className="caption text-muted tabular">
            {rows.length === STUDENTS.length
              ? `${STUDENTS.length} siswa`
              : `${rows.length} dari ${STUDENTS.length} siswa`}
          </span>
          {(activeFilterCount > 0 || query !== "") && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setFilters({})
                setQuery("")
              }}
            >
              Hapus saringan
            </button>
          )}
        </div>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(s) => s.nis}
        defaultSort={{ key: "name", dir: "asc" }}
        emptyText="Tidak ada siswa yang cocok dengan pencarian atau saringan."
      />
    </section>
  )
}
