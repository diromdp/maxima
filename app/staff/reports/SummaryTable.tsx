"use client"

import { formatPercent } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"

import { collectibility, type Summary } from "./sample"

export function SummaryTable({
  head,
  rows,
  total,
  extra,
}: {
  head: string
  rows: readonly Summary[]
  total: Summary
  extra?: (row: Summary) => React.ReactNode
}) {
  const cells = (row: Summary) => (
    <>
      <td className="numeric tabular">{row.students} siswa</td>
      <td className="numeric tabular">{formatMoney(row.billedIdr)}</td>
      <td className="numeric tabular text-success">{formatMoney(row.paidIdr)}</td>
      <td className="numeric tabular text-success">{formatMoney(row.paidEur)}</td>
      <td className={`numeric tabular${row.dueIdr.amount > 0 ? " text-danger" : ""}`}>
        {formatMoney(row.dueIdr)}
      </td>
      <td className={`numeric tabular${row.dueEur.amount > 0 ? " text-danger" : ""}`}>
        {formatMoney(row.dueEur)}
      </td>
      <td className="numeric tabular">
        <span
          className={`badge ${collectibility(row) >= 0.6 ? "badge-success" : collectibility(row) >= 0.3 ? "badge-warning" : "badge-danger"}`}
        >
          {formatPercent(collectibility(row))}
        </span>
      </td>
    </>
  )

  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>{head}</th>
            {extra && <th />}
            <th className="numeric">Jumlah Siswa</th>
            <th className="numeric">Total Penagihan (Rp)</th>
            <th className="numeric">Pemasukan (Rp)</th>
            <th className="numeric">Pemasukan (EUR)</th>
            <th className="numeric">Piutang (Rp)</th>
            <th className="numeric">Piutang (EUR)</th>
            <th className="numeric">Kolektibilitas</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td style={{ fontWeight: 600 }}>{row.label}</td>
              {extra && <td className="text-muted">{extra(row)}</td>}
              {cells(row)}
            </tr>
          ))}
          <tr style={{ fontWeight: 700 }}>
            <td>{total.label}</td>
            {extra && <td />}
            {cells(total)}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
