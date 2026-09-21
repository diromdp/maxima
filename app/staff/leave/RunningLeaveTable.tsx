"use client"

import Link from "next/link"

import { DataTable } from "@/src/components/data/DataTable"
import { formatDate } from "@/src/lib/format"

import {
  isOverdue,
  remainingDays,
  remainingLabel,
  RETURN_STATUSES,
  returnLabel,
  returnTone,
  type StaffLeave,
} from "./sample"

export function RunningLeaveTable({ rows }: { rows: readonly StaffLeave[] }) {
  return (
    <DataTable
      rows={rows}
      rowKey={(leave) => leave.id}
      defaultSort={{ key: "sisa", dir: "asc" }}
      stickyLast
      emptyText="Tidak ada siswa yang sedang menjalani cuti."
      filter={{ value: (leave) => returnLabel(leave), options: RETURN_STATUSES, allLabel: "Semua" }}
      columns={[
        {
          key: "nis",
          header: "NIS",
          sort: (leave) => leave.student.nis,
          cell: (leave) => leave.student.nis,
        },
        {
          key: "siswa",
          header: "Nama Siswa",
          sort: (leave) => leave.student.name,
          cell: (leave) => (
            <div className="stack" style={{ gap: 0 }}>
              <span className="text-ink" style={{ fontWeight: 600 }}>
                {leave.student.name}
              </span>
              <span className="caption text-muted">{leave.student.branch}</span>
            </div>
          ),
        },
        {
          key: "mulai",
          header: "Mulai",
          sort: (leave) => leave.start,
          cell: (leave) => formatDate(leave.start),
        },
        {
          key: "berakhir",
          header: "Berakhir",
          sort: (leave) => leave.end,
          cell: (leave) => formatDate(leave.end),
        },
        {
          key: "sisa",
          header: "Sisa Hari",
          align: "right",
          sort: (leave) => remainingDays(leave),
          cell: (leave) => (
            <span className={isOverdue(leave) ? "text-danger" : undefined}>
              {remainingLabel(leave)}
            </span>
          ),
        },
        {
          key: "kembali",
          header: "Status Kembali",
          sort: (leave) => returnLabel(leave),
          cell: (leave) => (
            <span className={`badge badge-${returnTone(leave)}`}>{returnLabel(leave)}</span>
          ),
        },
        {
          key: "aksi",
          header: "Aksi",
          cell: (leave) => (
            <Link
              className={`btn ${isOverdue(leave) ? "btn-danger" : "btn-secondary"} btn-sm`}
              href={`/staff/leave/${leave.id}`}
            >
              {isOverdue(leave) ? "Tindak Lanjut" : "Detail"}
            </Link>
          ),
        },
      ]}
    />
  )
}
