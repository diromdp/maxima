"use client"

import Link from "next/link"

import { DataTable } from "@/src/components/data/DataTable"
import {
  remainingLabel,
  RETURN_STATUSES,
  RETURN_TONE,
  type RunningLeaveRow,
} from "@/src/entities/leave/schema"
import { formatDate } from "@/src/lib/format"

const isOverdue = (leave: RunningLeaveRow) => leave.returnStatus === "Lewat Batas"

export function RunningLeaveTable({ rows }: { rows: readonly RunningLeaveRow[] }) {
  return (
    <DataTable
      rows={rows}
      rowKey={(leave) => leave.id}
      defaultSort={{ key: "sisa", dir: "asc" }}
      stickyLast
      emptyText="Tidak ada siswa yang sedang menjalani cuti."
      filter={{
        value: (leave) => leave.returnStatus ?? "",
        options: RETURN_STATUSES,
        allLabel: "Semua",
      }}
      columns={[
        {
          key: "nis",
          header: "NIS",
          sort: (leave) => leave.nis ?? "",
          cell: (leave) => leave.nis ?? "-",
        },
        {
          key: "siswa",
          header: "Nama Siswa",
          sort: (leave) => leave.name,
          cell: (leave) => (
            <div className="stack" style={{ gap: 0 }}>
              <span className="text-ink" style={{ fontWeight: 600 }}>
                {leave.name}
              </span>
              <span className="caption text-muted">{leave.branch ?? "-"}</span>
            </div>
          ),
        },
        {
          key: "mulai",
          header: "Mulai",
          sort: (leave) => leave.startsOn,
          cell: (leave) => formatDate(leave.startsOn),
        },
        {
          key: "berakhir",
          header: "Berakhir",
          sort: (leave) => leave.returnsOn,
          cell: (leave) => formatDate(leave.returnsOn),
        },
        {
          key: "sisa",
          header: "Sisa Hari",
          align: "right",
          sort: (leave) => leave.remainingDays,
          cell: (leave) => (
            <span className={isOverdue(leave) ? "text-danger" : undefined}>
              {remainingLabel(leave.remainingDays)}
            </span>
          ),
        },
        {
          key: "kembali",
          header: "Status Kembali",
          sort: (leave) => leave.returnStatus ?? "",
          cell: (leave) =>
            leave.returnStatus ? (
              <span className={`badge badge-${RETURN_TONE[leave.returnStatus]}`}>
                {leave.returnStatus}
              </span>
            ) : (
              <span className="badge badge-beres">Cuti Disetujui</span>
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
