"use client"

import Link from "next/link"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"

import { completeness, type DocumentStudent, GROUPS, isGroupLocked, waitingCount } from "./sample"

const toneFor = (done: number, total: number) =>
  done === total ? "badge-beres" : done === 0 ? "badge-tindakan" : "badge-berjalan"

export function StudentIndex({ students }: { students: readonly DocumentStudent[] }) {
  const columns: readonly DataColumn<DocumentStudent>[] = [
    {
      key: "nis",
      header: "NIS",
      sort: (student) => student.nis,
      cell: (student) => <span className="tabular text-muted">{student.nis}</span>,
    },
    {
      key: "name",
      header: "Nama Siswa",
      sort: (student) => student.name,
      cell: (student) => (
        <span className="stack" style={{ gap: 0 }}>
          <span style={{ fontWeight: 600 }}>{student.name}</span>
          <span className="caption text-muted">
            {student.packageName} · {student.branch}
          </span>
        </span>
      ),
    },
    ...GROUPS.map((group): DataColumn<DocumentStudent> => ({
      key: group.id,
      header: group.name,
      sort: (student) => completeness(student, group.id).done,
      cell: (student) => {
        if (isGroupLocked(student, group.id)) {
          return <span className="badge badge-terkunci">Terkunci</span>
        }
        const { done, total } = completeness(student, group.id)
        return (
          <span className={`badge ${toneFor(done, total)} tabular`}>
            {done}/{total}
          </span>
        )
      },
    })),
    {
      key: "waiting",
      header: "Menunggu",
      align: "right",
      sort: (student) => waitingCount(student),
      cell: (student) => {
        const count = waitingCount(student)
        return count > 0 ? (
          <span className="tabular text-warning" style={{ fontWeight: 700 }}>
            {count} berkas
          </span>
        ) : (
          <span className="text-muted">-</span>
        )
      },
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      cell: (student) => {
        const waiting = waitingCount(student)
        return (
          <Link
            href={`/staff/documents/${student.nis}`}
            className={`btn btn-sm ${waiting > 0 ? "btn-primary" : "btn-secondary"}`}
            title={
              waiting > 0
                ? `${waiting} berkas menunggu verifikasi`
                : "Tidak ada yang menunggu, buka untuk melihat berkas"
            }
          >
            {waiting > 0 ? `Verifikasi (${waiting})` : "Lihat Berkas"}
          </Link>
        )
      },
    },
  ]

  return (
    <DataTable
      rows={students}
      columns={columns}
      rowKey={(student) => student.nis}
      defaultSort={{ key: "waiting", dir: "desc" }}
      emptyText="Tidak ada siswa yang cocok dengan pencarian atau saringan."
    />
  )
}
