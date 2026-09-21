"use client"

import Link from "next/link"

import { formatDate } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"

import { type DebtRow, debtTotal } from "./sample"

export function DebtCard({
  rows,
  until,
  label,
}: {
  rows: readonly DebtRow[]
  until: string
  label: string
}) {
  const sorted = [...rows].sort((a, b) => b.dueIdr.amount - a.dueIdr.amount)

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="stack" style={{ gap: 2 }}>
          <h2 className="h6">Piutang Belum Dibayar per Siswa</h2>
          <span className="caption text-muted">
            Cicilan yang sudah jatuh tempo tetapi belum dibayar sampai {formatDate(until)} ({label}
            ). Angka yang sama dengan Neraca Keuangan di Beranda; hanya Rupiah karena Euro tanpa
            jadwal.
          </span>
        </div>
        <div className="stack" style={{ gap: 0, alignItems: "flex-end" }}>
          <span className="h5 tabular text-danger">{formatMoney(debtTotal(rows))}</span>
          <span className="caption text-muted">{rows.length} siswa tertunggak</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="row-soft">
          <span className="body-sm text-muted">Tidak ada cicilan tertunggak pada {label}.</span>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Siswa</th>
                <th>Paket</th>
                <th>Cabang</th>
                <th>PIC</th>
                <th className="numeric">Target sampai {formatDate(until)}</th>
                <th className="numeric">Dibayar sampai {formatDate(until)}</th>
                <th className="numeric">Piutang (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.receivable.student.nis}>
                  <td>
                    <div className="stack" style={{ gap: 0 }}>
                      <Link
                        className="link"
                        href={`/staff/students/${row.receivable.student.nis}?tab=finance`}
                      >
                        {row.receivable.student.name}
                      </Link>
                      <span className="caption text-muted">{row.receivable.student.nis}</span>
                    </div>
                  </td>
                  <td>{row.receivable.pkg.name}</td>
                  <td>{row.receivable.student.branch}</td>
                  <td>{row.receivable.student.pic}</td>
                  <td className="numeric tabular">{formatMoney(row.targetIdr)}</td>
                  <td className="numeric tabular text-success">{formatMoney(row.paidIdr)}</td>
                  <td className="numeric tabular text-danger">{formatMoney(row.dueIdr)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700 }}>
                <td colSpan={6}>Total piutang belum dibayar</td>
                <td className="numeric tabular text-danger">{formatMoney(debtTotal(rows))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
