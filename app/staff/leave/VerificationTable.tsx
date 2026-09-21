"use client"

import Link from "next/link"

import { DataTable } from "@/src/components/data/DataTable"
import { formatDate } from "@/src/lib/format"

import { historyBadge } from "../../portal/leave/leave"
import { decisionLabel, type StaffLeave } from "./sample"

export function VerificationTable({ rows }: { rows: readonly StaffLeave[] }) {
  const statuses = [...new Set(rows.map((leave) => historyBadge(leave.state).label))]

  return (
    <DataTable
      rows={rows}
      rowKey={(leave) => leave.id}
      defaultSort={{ key: "diajukan", dir: "asc" }}
      stickyLast
      emptyText="Tidak ada pengajuan yang menunggu keputusan."
      filter={{
        value: (leave) => historyBadge(leave.state).label,
        options: statuses,
        allLabel: "Semua tahap",
      }}
      columns={[
        {
          key: "siswa",
          header: "Nama Siswa",
          sort: (leave) => leave.student.name,
          cell: (leave) => (
            <div className="stack" style={{ gap: 0 }}>
              <span className="text-ink" style={{ fontWeight: 600 }}>
                {leave.student.name}
              </span>
              <span className="caption text-muted tabular">NIS {leave.student.nis}</span>
            </div>
          ),
        },
        {
          key: "program",
          header: "Program / Level",
          sort: (leave) => leave.student.packageName,
          cell: (leave) => `${leave.student.packageName} · ${leave.student.level}`,
        },
        {
          key: "cabang",
          header: "Cabang",
          sort: (leave) => leave.student.branch,
          cell: (leave) => leave.student.branch,
        },
        {
          key: "diajukan",
          header: "Tanggal Ajuan",
          sort: (leave) => leave.submittedAt,
          cell: (leave) => formatDate(leave.submittedAt),
        },
        {
          key: "mulai",
          header: "Tanggal Mulai",
          sort: (leave) => leave.start,
          cell: (leave) => formatDate(leave.start),
        },
        { key: "alasan", header: "Alasan Cuti", wrap: true, cell: (leave) => leave.reason },
        {
          key: "status",
          header: "Tahap",
          sort: (leave) => historyBadge(leave.state).label,
          cell: (leave) => {
            const badge = historyBadge(leave.state)
            return <span className={`badge badge-${badge.tone}`}>{badge.label}</span>
          },
        },
        {
          key: "aksi",
          header: "Aksi",
          cell: (leave) => (
            <Link className="btn btn-primary btn-sm" href={`/staff/leave/${leave.id}`}>
              {decisionLabel(leave)}
            </Link>
          ),
        },
      ]}
    />
  )
}
