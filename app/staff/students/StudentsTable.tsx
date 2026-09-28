"use client"

import Link from "next/link"

import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { QueryError } from "@/src/components/data/QueryError"
import { ServerDataTable } from "@/src/components/data/ServerDataTable"
import type { DataColumn } from "@/src/components/data/TableFrame"
import { studentFilterOptionsQuery, studentsQuery } from "@/src/entities/student/queries"
import {
  CANDIDATE_STATUS,
  FUNNEL_STAGES,
  STATUS_BADGE,
  STUDENT_FILTERS,
  STUDENT_STATUSES,
  type StudentFilterOptions,
  type StudentListRow,
} from "@/src/entities/student/schema"
import { useRead } from "@/src/lib/api/use-read"
import { useListParams } from "@/src/lib/use-list-params"

const DASH = "-"

type Choice = { value: string; label: string }

const choicesFrom = (values: readonly string[]): Choice[] =>
  values.map((value) => ({ value, label: value }))

const FILTER_FIELDS: readonly {
  name: (typeof STUDENT_FILTERS)[number]
  label: string
  options: keyof StudentFilterOptions | Choice[]
}[] = [
  { name: "branch", label: "cabang", options: "branches" },
  { name: "program", label: "program", options: "programs" },
  { name: "major", label: "jurusan", options: "majors" },
  {
    name: "status",
    label: "status",
    options: choicesFrom([...STUDENT_STATUSES, CANDIDATE_STATUS]),
  },
  { name: "stage", label: "tahap", options: choicesFrom(FUNNEL_STAGES.slice(1)) },
  { name: "level", label: "level", options: "levels" },
  { name: "package", label: "paket", options: "packages" },
  { name: "pic", label: "PIC", options: "pics" },
  { name: "leadSource", label: "sumber lead", options: "leadSources" },
]

const COLUMNS: readonly DataColumn<StudentListRow>[] = [
  {
    key: "name",
    header: "Nama",
    sortKey: "name",
    cell: (s) => (
      <div className="stack" style={{ gap: 0 }}>
        {s.nis ? (
          <Link
            href={`/staff/students/${encodeURIComponent(s.nis)}`}
            className="text-ink no-underline hover:underline"
            style={{ fontWeight: 600, whiteSpace: "nowrap" }}
          >
            {s.name}
          </Link>
        ) : (
          <span className="text-ink" style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
            {s.name}
          </span>
        )}
        <span className="caption text-muted tabular">
          {s.nis ? `NIS ${s.nis}` : "NIS terbit setelah DP disahkan"}
        </span>
      </div>
    ),
  },
  {
    key: "contract",
    header: "No Kontrak",
    cell: (s) => <span className="tabular">{s.contractNumber ?? DASH}</span>,
  },
  { key: "branch", header: "Cabang", cell: (s) => s.branch.name },
  { key: "program", header: "Program", cell: (s) => s.program?.name ?? DASH },
  {
    key: "status",
    header: "Status",
    cell: (s) => <span className={`badge ${STATUS_BADGE[s.status]}`}>{s.status}</span>,
  },
  {
    key: "level",
    header: "Level",
    cell: (s) => (s.level ? <span className="badge">{s.level.name}</span> : DASH),
  },
  { key: "pic", header: "PIC", cell: (s) => s.pic?.name ?? DASH },
  {
    key: "completeness",
    header: "Kelengkapan",
    cell: (s) => (
      <span className={`badge ${s.completeness === "Lengkap" ? "badge-beres" : "badge-tindakan"}`}>
        {s.completeness}
      </span>
    ),
  },
]

export function StudentsTable() {
  const { params } = useListParams(STUDENT_FILTERS)
  const students = useRead(studentsQuery(params))
  const options = useRead(studentFilterOptionsQuery())

  const choicesOf = (source: keyof StudentFilterOptions | Choice[]) =>
    Array.isArray(source)
      ? source
      : (options.data?.[source] ?? []).map((item) => ({ value: item.id, label: item.name }))

  return (
    <section className="card stack">
      <div className="row">
        <h2 className="h5">Daftar Siswa</h2>
        {students.data && <span className="pill tabular">{students.data.meta.total} siswa</span>}
      </div>

      <div className="row row-wrap" style={{ gap: 8 }}>
        <ListSearch label="Cari nama, NIS, NIK, No Kontrak" />
        {FILTER_FIELDS.map((field) => (
          <ListFilter
            key={field.name}
            name={field.name}
            label={field.label}
            options={choicesOf(field.options)}
          />
        ))}
      </div>

      {students.isError ? (
        <QueryError message={students.error.message} onRetry={() => void students.refetch()} />
      ) : (
        <ServerDataTable
          rows={students.data?.data ?? []}
          total={students.data?.meta.total ?? 0}
          isPending={students.isPending}
          columns={COLUMNS}
          rowKey={(s) => s.id}
          emptyText="Tidak ada siswa yang cocok dengan pencarian atau saringan."
        />
      )}
    </section>
  )
}
