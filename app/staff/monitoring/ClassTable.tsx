"use client"

import { DataTable } from "@/src/components/data/DataTable"
import { QueryError } from "@/src/components/data/QueryError"
import { TableSkeleton } from "@/src/components/data/TableSkeleton"
import { monitoringClassesQuery } from "@/src/entities/monitoring/queries"
import type { MonitoringClassRow } from "@/src/entities/monitoring/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH } from "@/src/lib/format"

import { averageText, chapterText, percentText, SKELETON_ROWS } from "./format"

const COLUMN_COUNT = 8

const riskBadge = (count: number) =>
  count === 0 ? "badge-success" : count >= 3 ? "badge-danger" : "badge-warning"

export function ClassTable() {
  const classes = useRead(monitoringClassesQuery())

  return (
    <section className="card stack">
      <div className="stack stack-sm">
        <h2 className="h6">Per kelas</h2>
        <span className="caption text-muted">
          Hanya kelas aktif. Siswa berstatus Cuti dan Keluar tidak dihitung.
        </span>
      </div>

      {classes.isError ? (
        <QueryError message={classes.error.message} onRetry={() => void classes.refetch()} />
      ) : classes.isPending ? (
        <TableSkeleton columns={COLUMN_COUNT} rows={SKELETON_ROWS} />
      ) : (
        <DataTable<MonitoringClassRow>
          rows={classes.data.data}
          rowKey={(row) => row.id}
          defaultSort={{ key: "berisiko", dir: "desc" }}
          emptyText="Belum ada kelas aktif."
          columns={[
            {
              key: "kelas",
              header: "Nama Kelas",
              sort: (row) => row.name,
              cell: (row) => row.name,
            },
            {
              key: "level",
              header: "Level",
              sort: (row) => row.level.name,
              cell: (row) => row.level.name,
            },
            {
              key: "pengajar",
              header: "Pengajar",
              sort: (row) => row.teacher?.name ?? "",
              cell: (row) => row.teacher?.name ?? <span className="text-muted">{DASH}</span>,
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
              cell: (row) => averageText(row.averageScore),
            },
            {
              key: "kehadiran",
              header: "Rata-rata Kehadiran",
              align: "right",
              sort: (row) => row.averageAttendance ?? -1,
              cell: (row) => percentText(row.averageAttendance),
            },
            {
              key: "berisiko",
              header: "Siswa Berisiko",
              sort: (row) => row.atRiskCount,
              cell: (row) => (
                <span className={`badge ${riskBadge(row.atRiskCount)}`}>
                  {row.atRiskCount} siswa
                </span>
              ),
            },
            {
              key: "progres",
              header: "Progress Materi",
              sort: (row) => row.currentChapter ?? -1,
              cell: (row) => chapterText(row.currentChapter, row.totalChapters),
            },
          ]}
        />
      )}
    </section>
  )
}
