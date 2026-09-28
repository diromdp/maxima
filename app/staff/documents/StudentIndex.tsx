"use client"

import Link from "next/link"

import { ServerDataTable } from "@/src/components/data/ServerDataTable"
import type { DataColumn } from "@/src/components/data/TableFrame"
import {
  completenessTone,
  DOCUMENT_GROUPS,
  type DocumentIndexRow,
} from "@/src/entities/document/schema"

const columns: readonly DataColumn<DocumentIndexRow>[] = [
  {
    key: "nis",
    header: "NIS",
    cell: (row) => <span className="tabular text-muted">{row.nis}</span>,
  },
  {
    key: "name",
    header: "Nama Siswa",
    cell: (row) => (
      <span className="stack" style={{ gap: 0 }}>
        <span style={{ fontWeight: 600 }}>{row.name}</span>
        <span className="caption text-muted">
          {[row.package?.name, row.branch?.name].filter(Boolean).join(" · ")}
        </span>
      </span>
    ),
  },
  ...DOCUMENT_GROUPS.map((group): DataColumn<DocumentIndexRow> => ({
    key: group,
    header: group,
    cell: (row) => {
      const count = row.groups.find((candidate) => candidate.group === group)
      if (!count) return <span className="text-muted">-</span>
      return (
        <span className={`badge ${completenessTone(count)} tabular`}>
          {count.complete}/{count.total}
        </span>
      )
    },
  })),
  {
    key: "pending",
    header: "Menunggu",
    align: "right",
    cell: (row) =>
      row.pending > 0 ? (
        <span className="tabular text-warning" style={{ fontWeight: 700 }}>
          {row.pending} berkas
        </span>
      ) : (
        <span className="text-muted">-</span>
      ),
  },
  {
    key: "actions",
    header: "Aksi",
    align: "right",
    cell: (row) => (
      <Link
        href={`/staff/documents/${encodeURIComponent(row.nis)}`}
        className={`btn btn-sm ${row.pending > 0 ? "btn-primary" : "btn-secondary"}`}
        title={
          row.pending > 0
            ? `${row.pending} berkas menunggu verifikasi`
            : "Tidak ada yang menunggu, buka untuk melihat berkas"
        }
      >
        {row.pending > 0 ? `Verifikasi (${row.pending})` : "Lihat Berkas"}
      </Link>
    ),
  },
]

export function StudentIndex({
  rows,
  total,
  isPending,
}: {
  rows: readonly DocumentIndexRow[]
  total: number
  isPending: boolean
}) {
  return (
    <ServerDataTable
      rows={rows}
      total={total}
      isPending={isPending}
      columns={columns}
      rowKey={(row) => row.studentId}
      stickyLast
      emptyText="Tidak ada siswa yang cocok dengan pencarian atau saringan."
    />
  )
}
