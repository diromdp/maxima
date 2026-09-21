"use client"

import { DataTable } from "@/src/components/data/DataTable"
import { DASH, formatPercent } from "@/src/lib/format"

import { chapterLabel, CLASS_STATS, type ClassStats, formatAverage } from "./sample"

const riskBadge = (count: number) =>
  count === 0 ? "badge-success" : count >= 3 ? "badge-danger" : "badge-warning"

export function ClassTable() {
  return (
    <section className="card stack">
      <div className="stack stack-sm">
        <h2 className="h6">Per kelas</h2>
        <span className="caption text-muted">
          Hanya kelas aktif. Siswa berstatus Cuti dan Keluar tidak dihitung.
        </span>
      </div>

      <DataTable<ClassStats>
        rows={CLASS_STATS}
        rowKey={(row) => row.room.id}
        defaultSort={{ key: "berisiko", dir: "desc" }}
        columns={[
          {
            key: "kelas",
            header: "Nama Kelas",
            sort: (row) => row.room.name,
            cell: (row) => row.room.name,
          },
          {
            key: "level",
            header: "Level",
            sort: (row) => row.room.level,
            cell: (row) => row.room.level,
          },
          {
            key: "pengajar",
            header: "Pengajar",
            sort: (row) => row.room.teacher,
            cell: (row) => row.room.teacher,
          },
          {
            key: "siswa",
            header: "Jumlah Siswa",
            align: "right",
            sort: (row) => row.studentCount,
            cell: (row) => `${row.studentCount} siswa`,
          },
          {
            key: "nilai",
            header: "Rata-rata Nilai",
            align: "right",
            sort: (row) => row.averageScore ?? -1,
            cell: (row) => formatAverage(row.averageScore),
          },
          {
            key: "kehadiran",
            header: "Rata-rata Kehadiran",
            align: "right",
            sort: (row) => row.averageAttendance ?? -1,
            cell: (row) =>
              row.averageAttendance === null ? DASH : formatPercent(row.averageAttendance),
          },
          {
            key: "berisiko",
            header: "Siswa Berisiko",
            sort: (row) => row.atRiskCount,
            cell: (row) => (
              <span className={`badge ${riskBadge(row.atRiskCount)}`}>{row.atRiskCount} siswa</span>
            ),
          },
          {
            key: "progres",
            header: "Progress Materi",
            sort: (row) => row.chapter,
            cell: (row) => chapterLabel(row.chapter),
          },
        ]}
      />
    </section>
  )
}
