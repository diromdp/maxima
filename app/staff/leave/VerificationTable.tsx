"use client"

import Link from "next/link"

import { DataTable } from "@/src/components/data/DataTable"
import { DECISION_LABEL, type PendingLeaveRow, STATE_BADGE } from "@/src/entities/leave/schema"
import { formatDate } from "@/src/lib/format"

const STAGE_OPTIONS = (
  ["awaiting-finance", "payment-set", "awaiting-payment-check", "processing"] as const
).map((state) => STATE_BADGE[state].label)

export function VerificationTable({ rows }: { rows: readonly PendingLeaveRow[] }) {
  return (
    <DataTable
      rows={rows}
      rowKey={(leave) => leave.id}
      defaultSort={{ key: "diajukan", dir: "asc" }}
      stickyLast
      emptyText="Tidak ada pengajuan yang menunggu keputusan."
      filter={{
        value: (leave) => STATE_BADGE[leave.state].label,
        options: STAGE_OPTIONS,
        allLabel: "Semua tahap",
      }}
      columns={[
        {
          key: "siswa",
          header: "Nama Siswa",
          sort: (leave) => leave.name,
          cell: (leave) => (
            <div className="stack" style={{ gap: 0 }}>
              <span className="text-ink" style={{ fontWeight: 600 }}>
                {leave.name}
              </span>
              <span className="caption text-muted tabular">NIS {leave.nis ?? "-"}</span>
            </div>
          ),
        },
        {
          key: "program",
          header: "Program / Level",
          sort: (leave) => leave.program ?? "",
          cell: (leave) => [leave.program, leave.level].filter(Boolean).join(" · ") || "-",
        },
        {
          key: "cabang",
          header: "Cabang",
          sort: (leave) => leave.branch ?? "",
          cell: (leave) => leave.branch ?? "-",
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
          sort: (leave) => leave.startsOn,
          cell: (leave) => formatDate(leave.startsOn),
        },
        { key: "alasan", header: "Alasan Cuti", wrap: true, cell: (leave) => leave.reason },
        {
          key: "status",
          header: "Tahap",
          sort: (leave) => leave.stage,
          cell: (leave) => {
            const badge = STATE_BADGE[leave.state]
            return <span className={`badge badge-${badge.tone}`}>{badge.label}</span>
          },
        },
        {
          key: "aksi",
          header: "Aksi",
          cell: (leave) => (
            <Link className="btn btn-primary btn-sm" href={`/staff/leave/${leave.id}`}>
              {DECISION_LABEL[leave.state] ?? "Detail"}
            </Link>
          ),
        },
      ]}
    />
  )
}
