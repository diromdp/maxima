"use client"

import { Modal, Skeleton } from "@mantine/core"
import Link from "next/link"

import { QueryError } from "@/src/components/data/QueryError"
import { groupStudentsQuery } from "@/src/entities/report/queries"
import type { GroupBy } from "@/src/entities/report/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate } from "@/src/lib/format"
import { eur, formatMoney, idr } from "@/src/lib/money"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }
const SKELETON_ROWS = 5

export function StudentsModal({
  title,
  by,
  groupId,
  onClose,
}: {
  title: string
  by: GroupBy
  groupId: string
  onClose: () => void
}) {
  const students = useRead(groupStudentsQuery(by, groupId))

  return (
    <Modal opened onClose={onClose} title={title} size="xl" styles={TITLE_STYLE}>
      {students.isError ? (
        <QueryError message={students.error.message} onRetry={() => void students.refetch()} />
      ) : students.isPending ? (
        <div className="stack" aria-busy="true">
          <span className="sr-only" role="status">
            Memuat
          </span>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Skeleton key={index} height={44} radius="sm" aria-hidden />
          ))}
        </div>
      ) : (
        <div className="stack">
          <span className="caption text-muted">
            {students.data.length} siswa. Angka dibaca dari Tagihan &amp; Piutang; nama membuka
            detail siswa.
          </span>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Paket</th>
                  <th>Status</th>
                  <th className="numeric">Dibayar (Rp)</th>
                  <th className="numeric">Piutang (Rp)</th>
                  <th className="numeric">Piutang (EUR)</th>
                  <th>Terakhir Bayar</th>
                </tr>
              </thead>
              <tbody>
                {students.data.map((row) => (
                  <tr key={row.contractId}>
                    <td>
                      <div className="stack" style={{ gap: 0 }}>
                        <Link className="link" href={`/staff/students/${row.nis}?tab=finance`}>
                          {row.name}
                        </Link>
                        <span className="caption text-muted">
                          {row.nis} · {row.branch?.name ?? "Tanpa cabang"}
                        </span>
                      </div>
                    </td>
                    <td>{row.package.name}</td>
                    <td>{row.studentStatus}</td>
                    <td className="numeric tabular text-success">
                      {formatMoney(idr(row.paidIdr))}
                    </td>
                    <td className={`numeric tabular${row.remainingIdr > 0 ? " text-danger" : ""}`}>
                      {formatMoney(idr(row.remainingIdr))}
                    </td>
                    <td className={`numeric tabular${row.remainingEurCents ? " text-danger" : ""}`}>
                      {row.remainingEurCents === null
                        ? DASH
                        : formatMoney(eur(row.remainingEurCents))}
                    </td>
                    <td>{row.lastPaidOn ? formatDate(row.lastPaidOn) : DASH}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  )
}
