"use client"

import { Modal } from "@mantine/core"
import Link from "next/link"

import { DASH, formatDate } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"

import { type Receivable } from "../invoices/sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function StudentsModal({
  title,
  rows,
  onClose,
}: {
  title: string
  rows: readonly Receivable[]
  onClose: () => void
}) {
  return (
    <Modal opened onClose={onClose} title={title} size="xl" styles={TITLE_STYLE}>
      <div className="stack">
        <span className="caption text-muted">
          {rows.length} siswa. Angka dibaca dari Tagihan & Piutang; nama membuka detail siswa.
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
              {rows.map((row) => (
                <tr key={row.student.nis}>
                  <td>
                    <div className="stack" style={{ gap: 0 }}>
                      <Link
                        className="link"
                        href={`/staff/students/${row.student.nis}?tab=finance`}
                      >
                        {row.student.name}
                      </Link>
                      <span className="caption text-muted">
                        {row.student.nis} · {row.student.branch}
                      </span>
                    </div>
                  </td>
                  <td>{row.pkg.name}</td>
                  <td>{row.student.status}</td>
                  <td className="numeric tabular text-success">{formatMoney(row.paidIdr)}</td>
                  <td className={`numeric tabular${row.dueIdr.amount > 0 ? " text-danger" : ""}`}>
                    {formatMoney(row.dueIdr)}
                  </td>
                  <td
                    className={`numeric tabular${row.dueEur && row.dueEur.amount > 0 ? " text-danger" : ""}`}
                  >
                    {row.dueEur ? formatMoney(row.dueEur) : DASH}
                  </td>
                  <td>{row.lastPaid ? formatDate(row.lastPaid) : DASH}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  )
}
