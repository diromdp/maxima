"use client"

import Link from "next/link"

import { DataTable } from "@/src/components/data/DataTable"
import { QueryError } from "@/src/components/data/QueryError"
import { TableSkeleton } from "@/src/components/data/TableSkeleton"
import { monitoringTeachersQuery } from "@/src/entities/monitoring/queries"
import { LOW_PASS_RATE_PERCENT, type MonitoringTeacherRow } from "@/src/entities/monitoring/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH } from "@/src/lib/format"

import { averageText, percentText, SKELETON_ROWS } from "./format"

const COLUMN_COUNT = 8

const completeness = (value: number | null) =>
  value === null ? (
    <span className="text-muted">{DASH}</span>
  ) : (
    <span className={`tabular ${value >= 100 ? "text-success" : "text-danger"}`}>
      {percentText(value)}
    </span>
  )

export function TeacherTable() {
  const teachers = useRead(monitoringTeachersQuery())

  return (
    <section className="card stack">
      <div className="stack stack-sm">
        <h2 className="h6">Per pengajar</h2>
        <span className="caption text-muted">
          Kelengkapan absensi dan nilai adalah syarat raport terbit. Pengajar tanpa kelas aktif
          tampil kosong.
        </span>
      </div>

      {teachers.isError ? (
        <QueryError message={teachers.error.message} onRetry={() => void teachers.refetch()} />
      ) : teachers.isPending ? (
        <TableSkeleton columns={COLUMN_COUNT} rows={SKELETON_ROWS} />
      ) : (
        <DataTable<MonitoringTeacherRow>
          rows={teachers.data.data}
          rowKey={(row) => row.id}
          defaultSort={{ key: "absensi", dir: "asc" }}
          stickyLast
          emptyText="Belum ada pengajar."
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
                row.classes.length === 0 ? (
                  <span className="text-muted">{DASH}</span>
                ) : (
                  row.classes.map((room) => room.name).join(", ")
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
              cell: (row) => averageText(row.averageScore),
            },
            {
              key: "lulus",
              header: "Tingkat Kelulusan",
              align: "right",
              sort: (row) => row.passRate ?? -1,
              cell: (row) => (
                <span
                  className={
                    row.passRate !== null && row.passRate < LOW_PASS_RATE_PERCENT
                      ? "text-danger"
                      : ""
                  }
                >
                  {percentText(row.passRate)}
                </span>
              ),
            },
            {
              key: "absensi",
              header: "Kelengkapan Absensi",
              align: "right",
              sort: (row) => row.attendanceCompleteness ?? 200,
              cell: (row) => completeness(row.attendanceCompleteness),
            },
            {
              key: "nilai-terisi",
              header: "Kelengkapan Nilai",
              align: "right",
              sort: (row) => row.scoreCompleteness ?? 200,
              cell: (row) => completeness(row.scoreCompleteness),
            },
            {
              key: "aksi",
              header: "Aksi",
              cell: (row) =>
                row.classes.length > 0 ? (
                  <Link className="btn btn-secondary btn-sm" href="/staff/class-sessions">
                    Detail
                  </Link>
                ) : null,
            },
          ]}
        />
      )}
    </section>
  )
}
