"use client"

import Link from "next/link"

import { DataTable } from "@/src/components/data/DataTable"
import { DASH, formatPercent } from "@/src/lib/format"

import { formatAverage, TEACHER_STATS, type TeacherStats } from "./sample"

const percent = (value: number | null) => (value === null ? DASH : formatPercent(value))

const completeness = (value: number | null) =>
  value === null ? (
    <span className="text-muted">{DASH}</span>
  ) : (
    <span className={`tabular ${value >= 1 ? "text-success" : "text-danger"}`}>
      {formatPercent(value)}
    </span>
  )

export function TeacherTable() {
  return (
    <section className="card stack">
      <div className="stack stack-sm">
        <h2 className="h6">Per pengajar</h2>
        <span className="caption text-muted">
          Kelengkapan absensi dan nilai adalah syarat raport terbit. Pengajar tanpa kelas aktif
          tampil kosong.
        </span>
      </div>

      <DataTable<TeacherStats>
        rows={TEACHER_STATS}
        rowKey={(row) => row.name}
        defaultSort={{ key: "absensi", dir: "asc" }}
        stickyLast
        columns={[
          {
            key: "nama",
            header: "Nama Pengajar",
            sort: (row) => row.name,
            cell: (row) => row.name,
          },
          {
            key: "kelas",
            header: "Kelas Diajar",
            cell: (row) =>
              row.rooms.length === 0 ? (
                <span className="text-muted">{DASH}</span>
              ) : (
                row.rooms.map((room) => `${room.name} ${room.level}`).join(", ")
              ),
          },
          {
            key: "siswa",
            header: "Total Siswa",
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
            key: "lulus",
            header: "Tingkat Kelulusan",
            align: "right",
            sort: (row) => row.passRate ?? -1,
            cell: (row) => (
              <span className={row.passRate !== null && row.passRate < 0.75 ? "text-danger" : ""}>
                {percent(row.passRate)}
              </span>
            ),
          },
          {
            key: "absensi",
            header: "Kelengkapan Absensi",
            align: "right",
            sort: (row) => row.attendanceFilled ?? 2,
            cell: (row) => completeness(row.attendanceFilled),
          },
          {
            key: "nilai-terisi",
            header: "Kelengkapan Nilai",
            align: "right",
            sort: (row) => row.scoresFilled ?? 2,
            cell: (row) => completeness(row.scoresFilled),
          },
          {
            key: "aksi",
            header: "Aksi",
            cell: (row) =>
              row.rooms.length > 0 ? (
                <Link className="btn btn-secondary btn-sm" href="/staff/class-sessions">
                  Detail
                </Link>
              ) : null,
          },
        ]}
      />
    </section>
  )
}
